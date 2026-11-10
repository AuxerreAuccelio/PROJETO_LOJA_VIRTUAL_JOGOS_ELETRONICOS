/*
Detalhes que importam: tudo roda numa transação (se um item falhar, nada é gravado), o total é somado em centavos para evitar erro de arredondamento, 
e o buscar só devolve pedidos do próprio cliente (outro cliente recebe 404).
*/


const db = require('../config/database');
const ErroNegocio = require('../utils/ErroNegocio');
const { pedidoSchema } = require('../validations/pedidoSchema');
const { criarCliente, Preference, buscarPagamentos } = require('../config/mercadopago');
const { escolherAprovado, registrarAprovado } = require('../services/pagamentos');

const gravarPedido = db.transaction((id_cliente, itens) => {
  const buscar = db.prepare('SELECT id_jogo, nome, preco, estoque FROM JOGO WHERE id_jogo = ? AND ativo = 1');
  let centavos = 0;
  const linhas = [];

  for (const it of itens) {
    const jogo = buscar.get(it.id_jogo);
    if (!jogo) throw new ErroNegocio(404, `Jogo ${it.id_jogo} não encontrado`);
    if (jogo.estoque < it.quantidade) throw new ErroNegocio(409, `Estoque insuficiente para ${jogo.nome}`);
    centavos += Math.round(jogo.preco * 100) * it.quantidade;
    linhas.push({ ...it, preco_unitario: jogo.preco });
  }

  const valor_total = centavos / 100;
  const { lastInsertRowid } = db
    .prepare('INSERT INTO PEDIDO (id_cliente, valor_total) VALUES (?, ?)')
    .run(id_cliente, valor_total);

  const inserirItem = db.prepare(
    'INSERT INTO ITEM_PEDIDO (id_pedido, id_jogo, quantidade, preco_unitario) VALUES (?, ?, ?, ?)'
  );
  for (const l of linhas) inserirItem.run(lastInsertRowid, l.id_jogo, l.quantidade, l.preco_unitario);

  return { id_pedido: Number(lastInsertRowid), status: 'aguardando_pagamento', valor_total, itens: linhas };
});

const pedidosController = {
  criar: (req, res) => {
    const resultado = pedidoSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        erros: resultado.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
      });
    }
    res.status(201).json(gravarPedido(req.cliente.id_cliente, resultado.data.itens));
  },

  buscar: (req, res) => {
    const pedido = db
      .prepare('SELECT * FROM PEDIDO WHERE id_pedido = ? AND id_cliente = ?')
      .get(req.params.id, req.cliente.id_cliente);
    if (!pedido) return res.status(404).json({ mensagem: 'Pedido não encontrado' });

    const itens = db
      .prepare(`SELECT i.id_jogo, j.nome, i.quantidade, i.preco_unitario
                FROM ITEM_PEDIDO i JOIN JOGO j ON j.id_jogo = i.id_jogo WHERE i.id_pedido = ?`)
      .all(pedido.id_pedido);
    res.json({ ...pedido, itens });
  },

  pagar: async (req, res) => {
    const pedido = db
      .prepare('SELECT * FROM PEDIDO WHERE id_pedido = ? AND id_cliente = ?')
      .get(req.params.id, req.cliente.id_cliente);
    if (!pedido) throw new ErroNegocio(404, 'Pedido não encontrado');
    if (pedido.status !== 'aguardando_pagamento') {
      throw new ErroNegocio(409, 'Pedido não está aguardando pagamento');
    }

    const base = process.env.BASE_URL_PUBLICA;
    if (!base || !base.startsWith('https://')) {
      throw new Error('BASE_URL_PUBLICA precisa ser um endereço https');
    }

    const itens = db
      .prepare(`SELECT i.id_jogo, j.nome, i.quantidade, i.preco_unitario
                FROM ITEM_PEDIDO i JOIN JOGO j ON j.id_jogo = i.id_jogo WHERE i.id_pedido = ?`)
      .all(pedido.id_pedido);

    const retorno = (r) => `${base}/?pedido=${pedido.id_pedido}&pagamento=${r}`;

    let resposta;
    try {
      resposta = await new Preference(criarCliente()).create({
        body: {
          items: itens.map(i => ({
            id: String(i.id_jogo),
            title: i.nome,
            quantity: i.quantidade,
            unit_price: i.preco_unitario,
            currency_id: 'BRL'
          })),
          external_reference: String(pedido.id_pedido),
          back_urls: { success: retorno('sucesso'), failure: retorno('falha'), pending: retorno('pendente') },
          auto_return: 'approved'
        }
      });
    } catch (err) {
      console.error('Mercado Pago:', err.message || err);
      throw new ErroNegocio(502, 'Não foi possível iniciar o pagamento');
    }

    db.prepare('UPDATE PEDIDO SET mp_preference_id = ? WHERE id_pedido = ?')
      .run(resposta.id, pedido.id_pedido);

    res.json({
      id_pedido: pedido.id_pedido,
      preference_id: resposta.id,
      init_point: resposta.init_point
    });
  },

  confirmar: async (req, res) => {
    const pedido = db
      .prepare('SELECT * FROM PEDIDO WHERE id_pedido = ? AND id_cliente = ?')
      .get(req.params.id, req.cliente.id_cliente);
    if (!pedido) throw new ErroNegocio(404, 'Pedido não encontrado');

    if (pedido.status !== 'aguardando_pagamento') {
      return res.json({ id_pedido: pedido.id_pedido, status: pedido.status, mensagem: 'Pedido já processado' });
    }

    let pagamentos;
    try {
      pagamentos = await buscarPagamentos(pedido.id_pedido);
    } catch (err) {
      console.error('Mercado Pago:', err.message || err);
      throw new ErroNegocio(502, 'Não foi possível consultar o pagamento');
    }

    const aprovado = escolherAprovado(pedido, pagamentos);
    if (!aprovado) {
      if (pagamentos.some(p => p.status === 'approved')) {
        console.warn(`Pedido ${pedido.id_pedido}: pagamento aprovado com valor ou moeda diferentes do pedido`);
        throw new ErroNegocio(409, 'O valor do pagamento não confere com o pedido');
      }
      const ultimo = pagamentos[0];
      return res.json({
        id_pedido: pedido.id_pedido,
        status: 'aguardando_pagamento',
        pagamento_mp: ultimo ? ultimo.status : null,
        mensagem: ultimo ? 'Pagamento ainda não aprovado' : 'Nenhum pagamento encontrado para este pedido'
      });
    }

    const r = registrarAprovado(db, pedido.id_pedido, aprovado);
    if (r.jaProcessado) {
      return res.json({ id_pedido: pedido.id_pedido, status: 'pago', mensagem: 'Pedido já processado' });
    }
    r.avisos.forEach(a => console.warn(a));

    res.json({
      id_pedido: pedido.id_pedido,
      status: 'pago',
      forma_pagamento: r.forma,
      codigos: r.codigos
    });
  }
};

module.exports = pedidosController;
