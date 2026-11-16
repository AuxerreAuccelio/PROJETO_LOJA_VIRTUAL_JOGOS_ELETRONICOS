const request = require('supertest');

jest.mock('../src/config/mercadopago', () => ({
  criarCliente: jest.fn(() => ({})),
  Preference: jest.fn(() => ({ create: jest.fn() })),
  buscarPagamentos: jest.fn()
}));

const app = require('../src/app');
const mp = require('../src/config/mercadopago');
const { db, prepararBanco, inserirJogo, inserirCodigos, inserirPedido, inserirCliente, tokenCliente } = require('./helpers');

const cliente = () => ({ Authorization: `Bearer ${tokenCliente()}` });
const confirmar = (id) => request(app).post(`/api/pedidos/${id}/confirmar`).set(cliente());

// Pagamento como o Mercado Pago o devolve
const pagamentoMP = (pedido, total, extra = {}) => ({
  id: 987654, status: 'approved', external_reference: String(pedido), currency_id: 'BRL',
  transaction_amount: total, payment_type_id: 'credit_card', payment_method_id: 'visa', installments: 1, ...extra
});

// Pedido com um jogo físico (estoque 5, compra 2) e um digital com dois códigos (compra 1)
function cenario() {
  const fisico = inserirJogo({ nome: 'Elden Ring', plataforma: 'PS5', preco: 150, tipo: 'fisico', estoque: 5 });
  const digital = inserirJogo({ nome: 'Cyberpunk 2077', preco: 199.9 });
  inserirCodigos(digital, ['AAA-111', 'BBB-222']);
  const pedido = inserirPedido({
    itens: [
      { id_jogo: fisico, quantidade: 2, preco_unitario: 150 },
      { id_jogo: digital, quantidade: 1, preco_unitario: 199.9 }
    ]
  });
  return { fisico, digital, pedido, total: 499.9 };
}

const estoque = (id) => db.prepare('SELECT estoque FROM JOGO WHERE id_jogo = ?').get(id).estoque;
const statusPedido = (id) => db.prepare('SELECT status FROM PEDIDO WHERE id_pedido = ?').get(id).status;
const totalPagamentos = () => db.prepare('SELECT COUNT(*) n FROM PAGAMENTO').get().n;

let spyAviso, spyErro;

beforeEach(() => {
  prepararBanco();
  mp.buscarPagamentos.mockReset();
  spyAviso = jest.spyOn(console, 'warn').mockImplementation(() => {});
  spyErro = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  spyAviso.mockRestore();
  spyErro.mockRestore();
});

describe('POST /api/pedidos/:id/confirmar: pagamento aprovado', () => {
  test('marca o pedido como pago, baixa o estoque físico, entrega o código e grava o pagamento', async () => {
    const { fisico, digital, pedido, total } = cenario();
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, total, { installments: 3 })]);

    const res = await confirmar(pedido);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id_pedido: pedido, status: 'pago', forma_pagamento: 'cartao_credito' });
    expect(res.body.codigos).toEqual([{ id_jogo: digital, nome: 'Cyberpunk 2077', codigo: 'AAA-111' }]);

    expect(statusPedido(pedido)).toBe('pago');
    expect(estoque(fisico)).toBe(3);   // 5 - 2
    expect(estoque(digital)).toBe(1);  // um código restante (trigger do banco)

    const pg = db.prepare('SELECT * FROM PAGAMENTO WHERE id_pedido = ?').get(pedido);
    expect(pg).toMatchObject({
      forma_pagamento: 'cartao_credito', parcelas: 3, valor: 499.9, status_pagamento: 'aprovado',
      intermediario: 'MercadoPago', id_transacao_externa: '987654'
    });

    const codigos = db.prepare('SELECT codigo, status, id_pedido FROM CODIGO_ATIVACAO ORDER BY id_codigo').all();
    expect(codigos).toEqual([
      { codigo: 'AAA-111', status: 'entregue', id_pedido: pedido },
      { codigo: 'BBB-222', status: 'disponivel', id_pedido: null }
    ]);
  });

  test('é idempotente: confirmar duas vezes não duplica pagamento nem baixa o estoque de novo', async () => {
    const { fisico, pedido, total } = cenario();
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, total)]);

    await confirmar(pedido);
    const segunda = await confirmar(pedido);

    expect(segunda.status).toBe(200);
    expect(segunda.body.mensagem).toBe('Pedido já processado');
    expect(totalPagamentos()).toBe(1);
    expect(estoque(fisico)).toBe(3);
    expect(mp.buscarPagamentos).toHaveBeenCalledTimes(1);
  });

  test('escolhe o pagamento aprovado quando também há uma tentativa recusada', async () => {
    const { pedido, total } = cenario();
    mp.buscarPagamentos.mockResolvedValue([
      pagamentoMP(pedido, total, { id: 2, status: 'rejected' }),
      pagamentoMP(pedido, total, { id: 1 })
    ]);

    const res = await confirmar(pedido);

    expect(res.body.status).toBe('pago');
    expect(db.prepare('SELECT id_transacao_externa FROM PAGAMENTO').get().id_transacao_externa).toBe('1');
  });

  test.each([
    ['Pix', { payment_type_id: 'bank_transfer', payment_method_id: 'pix' }, 'pix'],
    ['boleto', { payment_type_id: 'ticket', payment_method_id: 'bolbradesco' }, 'boleto'],
    ['cartão de débito', { payment_type_id: 'debit_card', payment_method_id: 'debvisa' }, 'cartao_debito'],
    ['saldo em conta', { payment_type_id: 'account_money', payment_method_id: 'account_money' }, 'saldo_mp']
  ])('converte o meio de pagamento: %s', async (_, meio, esperado) => {
    const { pedido, total } = cenario();
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, total, { ...meio, installments: 5 })]);

    const res = await confirmar(pedido);

    expect(res.body.forma_pagamento).toBe(esperado);
    // fora do cartão de crédito, o banco exige uma parcela só
    expect(db.prepare('SELECT parcelas FROM PAGAMENTO').get().parcelas).toBe(1);
  });

  test('422 para meio de pagamento desconhecido, sem alterar nada', async () => {
    const { fisico, pedido, total } = cenario();
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, total, { payment_type_id: 'atm', payment_method_id: 'x' })]);

    const res = await confirmar(pedido);

    expect(res.status).toBe(422);
    expect(res.body.mensagem).toContain('Meio de pagamento não suportado');
    expect(statusPedido(pedido)).toBe('aguardando_pagamento');
    expect(totalPagamentos()).toBe(0);
    expect(estoque(fisico)).toBe(5);
  });

  test('venda simultânea: com o estoque já esgotado, o pedido fica pago, o estoque trava em zero e há aviso', async () => {
    const { fisico, pedido, total } = cenario();
    db.prepare('UPDATE JOGO SET estoque = 1 WHERE id_jogo = ?').run(fisico);
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, total)]);

    const res = await confirmar(pedido);

    expect(res.status).toBe(200);
    expect(estoque(fisico)).toBe(0);
    expect(spyAviso).toHaveBeenCalledWith(expect.stringContaining('Estoque insuficiente'));
  });

  test('jogo digital sem códigos suficientes: pedido pago, sem código entregue e com aviso', async () => {
    const digital = inserirJogo({ nome: 'Sem Chaves', preco: 50 });
    const pedido = inserirPedido({ itens: [{ id_jogo: digital, quantidade: 1, preco_unitario: 50 }] });
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, 50)]);

    const res = await confirmar(pedido);

    expect(res.body.status).toBe('pago');
    expect(res.body.codigos).toEqual([]);
    expect(spyAviso).toHaveBeenCalledWith(expect.stringContaining('Faltam códigos'));
  });
});

describe('POST /api/pedidos/:id/confirmar: sem aprovação', () => {
  test('sem nenhum pagamento no Mercado Pago', async () => {
    const { pedido } = cenario();
    mp.buscarPagamentos.mockResolvedValue([]);

    const res = await confirmar(pedido);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'aguardando_pagamento', pagamento_mp: null });
    expect(res.body.mensagem).toBe('Nenhum pagamento encontrado para este pedido');
  });

  test.each(['rejected', 'pending', 'in_process'])('pagamento %s não libera nada', async (status) => {
    const { fisico, pedido, total } = cenario();
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, total, { status })]);

    const res = await confirmar(pedido);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'aguardando_pagamento', pagamento_mp: status });
    expect(statusPedido(pedido)).toBe('aguardando_pagamento');
    expect(totalPagamentos()).toBe(0);
    expect(estoque(fisico)).toBe(5);
  });

  test.each([
    ['valor diferente do pedido', { transaction_amount: 1 }],
    ['moeda diferente de BRL', { currency_id: 'USD' }],
    ['referência de outro pedido', { external_reference: '999' }]
  ])('409 para pagamento aprovado com %s', async (_, alteracao) => {
    const { fisico, pedido, total } = cenario();
    mp.buscarPagamentos.mockResolvedValue([pagamentoMP(pedido, total, alteracao)]);

    const res = await confirmar(pedido);

    expect(res.status).toBe(409);
    expect(res.body.mensagem).toBe('O valor do pagamento não confere com o pedido');
    expect(statusPedido(pedido)).toBe('aguardando_pagamento');
    expect(totalPagamentos()).toBe(0);
    expect(estoque(fisico)).toBe(5);
  });
});

describe('POST /api/pedidos/:id/confirmar: acesso e falhas', () => {
  test('404 para pedido de outro cliente, sem consultar o Mercado Pago', async () => {
    const outra = inserirCliente();
    const jogo = inserirJogo();
    const id = inserirPedido({ id_cliente: outra, itens: [{ id_jogo: jogo, quantidade: 1, preco_unitario: 100 }] });

    expect((await confirmar(id)).status).toBe(404);
    expect(mp.buscarPagamentos).not.toHaveBeenCalled();
  });

  test('401 sem token e 400 para id inválido', async () => {
    expect((await request(app).post('/api/pedidos/1/confirmar')).status).toBe(401);
    expect((await confirmar('abc')).status).toBe(400);
  });

  test('502 quando a consulta ao Mercado Pago falha, e o pedido continua aguardando', async () => {
    const { pedido } = cenario();
    mp.buscarPagamentos.mockRejectedValue(new Error('timeout'));

    const res = await confirmar(pedido);

    expect(res.status).toBe(502);
    expect(res.body.mensagem).toBe('Não foi possível consultar o pagamento');
    expect(statusPedido(pedido)).toBe('aguardando_pagamento');
  });

  test('pedido que já está pago responde sem consultar o Mercado Pago', async () => {
    const jogo = inserirJogo();
    const id = inserirPedido({ status: 'pago', itens: [{ id_jogo: jogo, quantidade: 1, preco_unitario: 100 }] });

    const res = await confirmar(id);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'pago', mensagem: 'Pedido já processado' });
    expect(mp.buscarPagamentos).not.toHaveBeenCalled();
  });
});