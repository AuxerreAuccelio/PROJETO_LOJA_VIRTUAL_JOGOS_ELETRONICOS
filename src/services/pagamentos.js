const ErroNegocio = require('../utils/ErroNegocio');

// Converte o tipo do Mercado Pago para o valor aceito em PAGAMENTO.forma_pagamento.
// Tipo desconhecido gera erro explícito, em vez de um palpite.
function formaPagamento(p) {
  if (p.payment_method_id === 'pix') return 'pix';
  switch (p.payment_type_id) {
    case 'credit_card': return 'cartao_credito';
    case 'debit_card': return 'cartao_debito';
    case 'ticket': return 'boleto';
    case 'account_money': return 'saldo_mp';
    default:
      throw new ErroNegocio(422, `Meio de pagamento não suportado: ${p.payment_type_id}`);
  }
}

const emCentavos = (v) => Math.round(Number(v) * 100);

// Só vale um pagamento aprovado, deste pedido, em reais e com o valor exato do pedido.
function escolherAprovado(pedido, pagamentos) {
  return pagamentos.find(p =>
    p.status === 'approved' &&
    String(p.external_reference) === String(pedido.id_pedido) &&
    p.currency_id === 'BRL' &&
    emCentavos(p.transaction_amount) === emCentavos(pedido.valor_total)
  ) || null;
}

// Grava o pagamento, marca o pedido como pago e dá baixa no estoque, tudo numa transação.
// Chamar de novo para o mesmo pedido não repete nada (idempotente).
function registrarAprovado(db, id_pedido, p) {
  return db.transaction(() => {
    const atual = db.prepare('SELECT status FROM PEDIDO WHERE id_pedido = ?').get(id_pedido);
    if (!atual || atual.status !== 'aguardando_pagamento') return { jaProcessado: true };

    const forma = formaPagamento(p);
    const parcelas = forma === 'cartao_credito' ? Math.min(Math.max(Number(p.installments) || 1, 1), 12) : 1;

    db.prepare(`INSERT INTO PAGAMENTO (id_pedido, forma_pagamento, parcelas, valor, status_pagamento, intermediario, id_transacao_externa)
                VALUES (?, ?, ?, ?, 'aprovado', 'MercadoPago', ?)`)
      .run(id_pedido, forma, parcelas, p.transaction_amount, String(p.id));
    db.prepare("UPDATE PEDIDO SET status = 'pago' WHERE id_pedido = ?").run(id_pedido);

    const itens = db.prepare('SELECT id_jogo, quantidade FROM ITEM_PEDIDO WHERE id_pedido = ?').all(id_pedido);
    const avisos = [];
    const codigos = [];

    for (const it of itens) {
      const jogo = db.prepare('SELECT nome, tipo, estoque FROM JOGO WHERE id_jogo = ?').get(it.id_jogo);

      if (jogo.tipo === 'fisico') {
        if (jogo.estoque < it.quantidade) avisos.push(`Estoque insuficiente de ${jogo.nome}: revisar o pedido ${id_pedido}`);
        db.prepare('UPDATE JOGO SET estoque = MAX(estoque - ?, 0) WHERE id_jogo = ?').run(it.quantidade, it.id_jogo);
      } else {
        const livres = db.prepare(`SELECT id_codigo, codigo FROM CODIGO_ATIVACAO
                                   WHERE id_jogo = ? AND status = 'disponivel' ORDER BY id_codigo LIMIT ?`)
          .all(it.id_jogo, it.quantidade);
        for (const c of livres) {
          db.prepare(`UPDATE CODIGO_ATIVACAO SET status = 'entregue', id_pedido = ?, data_entrega = CURRENT_TIMESTAMP
                      WHERE id_codigo = ?`).run(id_pedido, c.id_codigo);
          codigos.push({ id_jogo: it.id_jogo, nome: jogo.nome, codigo: c.codigo });
        }
        if (livres.length < it.quantidade) avisos.push(`Faltam códigos de ${jogo.nome}: revisar o pedido ${id_pedido}`);
      }
    }
    return { jaProcessado: false, forma, avisos, codigos };
  })();
}

module.exports = { formaPagamento, escolherAprovado, registrarAprovado };
