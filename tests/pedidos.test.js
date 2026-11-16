const request = require('supertest');

// O Mercado Pago é substituído por um simulado: nenhum teste usa rede nem token.
jest.mock('../src/config/mercadopago', () => {
  const create = jest.fn();
  return {
    criarCliente: jest.fn(() => ({})),
    Preference: jest.fn(() => ({ create })),
    buscarPagamentos: jest.fn(),
    __create: create
  };
});

const app = require('../src/app');
const mp = require('../src/config/mercadopago');
const { db, prepararBanco, inserirJogo, inserirPedido, inserirCliente, tokenAdmin, tokenCliente } = require('./helpers');

const cliente = () => ({ Authorization: `Bearer ${tokenCliente()}` });
let spyErro;

beforeEach(() => {
  prepararBanco();
  mp.__create.mockReset();
  process.env.BASE_URL_PUBLICA = 'https://exemplo.test';
  spyErro = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  spyErro.mockRestore();
});

const criarPedido = (itens) => request(app).post('/api/pedidos').set(cliente()).send({ itens });

describe('POST /api/pedidos', () => {
  test('401 sem token e 401 com token de administrador', async () => {
    const semToken = await request(app).post('/api/pedidos').send({ itens: [{ id_jogo: 1, quantidade: 1 }] });
    const admin = await request(app).post('/api/pedidos').set({ Authorization: `Bearer ${tokenAdmin()}` })
      .send({ itens: [{ id_jogo: 1, quantidade: 1 }] });
    expect(semToken.status).toBe(401);
    expect(admin.status).toBe(401);
  });

  test('201: calcula o total pelo preço do banco, grava os itens e não mexe no estoque', async () => {
    const a = inserirJogo({ nome: 'Elden Ring', plataforma: 'PS5', preco: 150, tipo: 'fisico', estoque: 5 });
    const b = inserirJogo({ nome: 'Cyberpunk 2077', preco: 199.9, estoque: 3 });

    const res = await criarPedido([{ id_jogo: a, quantidade: 2 }, { id_jogo: b, quantidade: 1 }]);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ status: 'aguardando_pagamento', valor_total: 499.9 });

    const pedido = db.prepare('SELECT * FROM PEDIDO WHERE id_pedido = ?').get(res.body.id_pedido);
    expect(pedido).toMatchObject({ id_cliente: 1, status: 'aguardando_pagamento', valor_total: 499.9 });

    const itens = db.prepare('SELECT id_jogo, quantidade, preco_unitario FROM ITEM_PEDIDO WHERE id_pedido = ? ORDER BY id_jogo')
      .all(res.body.id_pedido);
    expect(itens).toEqual([
      { id_jogo: a, quantidade: 2, preco_unitario: 150 },
      { id_jogo: b, quantidade: 1, preco_unitario: 199.9 }
    ]);

    // o estoque só baixa quando o pagamento for confirmado
    expect(db.prepare('SELECT estoque FROM JOGO WHERE id_jogo = ?').get(a).estoque).toBe(5);
    expect(db.prepare('SELECT estoque FROM JOGO WHERE id_jogo = ?').get(b).estoque).toBe(3);
  });

  test('ignora um preço enviado pelo cliente', async () => {
    const id = inserirJogo({ preco: 100, estoque: 5 });
    const res = await criarPedido([{ id_jogo: id, quantidade: 1, preco: 1, preco_unitario: 1 }]);
    expect(res.status).toBe(201);
    expect(res.body.valor_total).toBe(100);
  });

  test('soma em centavos, sem erro de arredondamento (3 x 0,10 = 0,30)', async () => {
    const id = inserirJogo({ preco: 0.1, estoque: 5 });
    const res = await criarPedido([{ id_jogo: id, quantidade: 3 }]);
    expect(res.body.valor_total).toBe(0.3);
  });

  test.each([
    ['lista vazia', []],
    ['quantidade zero', [{ id_jogo: 1, quantidade: 0 }]],
    ['quantidade acima de 10', [{ id_jogo: 1, quantidade: 11 }]],
    ['jogo repetido na lista', [{ id_jogo: 1, quantidade: 1 }, { id_jogo: 1, quantidade: 2 }]],
    ['id_jogo que não é número', [{ id_jogo: 'abc', quantidade: 1 }]]
  ])('400 para %s', async (_, itens) => {
    const res = await criarPedido(itens);
    expect(res.status).toBe(400);
  });

  test('404 para jogo inexistente ou desativado', async () => {
    const off = inserirJogo({ ativo: 0, estoque: 5 });
    expect((await criarPedido([{ id_jogo: 9999, quantidade: 1 }])).status).toBe(404);
    expect((await criarPedido([{ id_jogo: off, quantidade: 1 }])).status).toBe(404);
  });

  test('409 por estoque insuficiente, e nenhum pedido fica gravado (transação)', async () => {
    const bom = inserirJogo({ nome: 'Com estoque', estoque: 5 });
    const pouco = inserirJogo({ nome: 'Quase esgotado', estoque: 1 });

    const res = await criarPedido([{ id_jogo: bom, quantidade: 1 }, { id_jogo: pouco, quantidade: 2 }]);

    expect(res.status).toBe(409);
    expect(res.body.mensagem).toBe('Estoque insuficiente para Quase esgotado');
    expect(db.prepare('SELECT COUNT(*) n FROM PEDIDO').get().n).toBe(0);
    expect(db.prepare('SELECT COUNT(*) n FROM ITEM_PEDIDO').get().n).toBe(0);
  });
});

describe('GET /api/pedidos/:id', () => {
  test('200 com os itens do próprio pedido', async () => {
    const jogo = inserirJogo({ nome: 'Elden Ring' });
    const id = inserirPedido({ itens: [{ id_jogo: jogo, quantidade: 2, preco_unitario: 100 }] });

    const res = await request(app).get(`/api/pedidos/${id}`).set(cliente());

    expect(res.status).toBe(200);
    expect(res.body.itens).toEqual([{ id_jogo: jogo, nome: 'Elden Ring', quantidade: 2, preco_unitario: 100 }]);
  });

  test('404 para o pedido de outro cliente', async () => {
    const outra = inserirCliente();
    const jogo = inserirJogo();
    const id = inserirPedido({ id_cliente: outra, itens: [{ id_jogo: jogo, quantidade: 1, preco_unitario: 100 }] });
    expect((await request(app).get(`/api/pedidos/${id}`).set(cliente())).status).toBe(404);
  });

  test('400 para id inválido e 401 sem token', async () => {
    expect((await request(app).get('/api/pedidos/abc').set(cliente())).status).toBe(400);
    expect((await request(app).get('/api/pedidos/1')).status).toBe(401);
  });
});

describe('POST /api/pedidos/:id/pagar', () => {
  const novoPedido = () => {
    const jogo = inserirJogo({ nome: 'Elden Ring', preco: 150 });
    const id = inserirPedido({ itens: [{ id_jogo: jogo, quantidade: 2, preco_unitario: 150 }] });
    return { jogo, id };
  };
  const pagar = (id) => request(app).post(`/api/pedidos/${id}/pagar`).set(cliente());

  test('200: cria a preferência com os dados do banco e guarda o identificador', async () => {
    mp.__create.mockResolvedValue({ id: 'pref-123', init_point: 'https://mp.test/checkout?pref_id=pref-123' });
    const { jogo, id } = novoPedido();

    const res = await pagar(id);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id_pedido: id, preference_id: 'pref-123', init_point: 'https://mp.test/checkout?pref_id=pref-123' });

    const { body } = mp.__create.mock.calls[0][0];
    expect(body.items).toEqual([{ id: String(jogo), title: 'Elden Ring', quantity: 2, unit_price: 150, currency_id: 'BRL' }]);
    expect(body.external_reference).toBe(String(id));
    expect(body.back_urls.success).toBe(`https://exemplo.test/?pedido=${id}&pagamento=sucesso`);
    expect(body.auto_return).toBe('approved');

    expect(db.prepare('SELECT mp_preference_id FROM PEDIDO WHERE id_pedido = ?').get(id).mp_preference_id).toBe('pref-123');
  });

  test('404 para pedido de outro cliente, sem chamar o Mercado Pago', async () => {
    const outra = inserirCliente();
    const jogo = inserirJogo();
    const id = inserirPedido({ id_cliente: outra, itens: [{ id_jogo: jogo, quantidade: 1, preco_unitario: 100 }] });

    expect((await pagar(id)).status).toBe(404);
    expect(mp.__create).not.toHaveBeenCalled();
  });

  test('409 para pedido que já não está aguardando pagamento', async () => {
    const jogo = inserirJogo();
    const id = inserirPedido({ status: 'pago', itens: [{ id_jogo: jogo, quantidade: 1, preco_unitario: 100 }] });
    const res = await pagar(id);
    expect(res.status).toBe(409);
    expect(mp.__create).not.toHaveBeenCalled();
  });

  test('502 quando o Mercado Pago falha, e nada é gravado', async () => {
    mp.__create.mockRejectedValue(new Error('timeout'));
    const { id } = novoPedido();

    const res = await pagar(id);

    expect(res.status).toBe(502);
    expect(res.body.mensagem).toBe('Não foi possível iniciar o pagamento');
    expect(db.prepare('SELECT mp_preference_id FROM PEDIDO WHERE id_pedido = ?').get(id).mp_preference_id).toBeNull();
  });

  test('500 genérico quando BASE_URL_PUBLICA não é https', async () => {
    process.env.BASE_URL_PUBLICA = 'http://localhost:3000';
    const { id } = novoPedido();
    const res = await pagar(id);
    expect(res.status).toBe(500);
    expect(res.body.erro).toBe('Erro interno do servidor');
    expect(mp.__create).not.toHaveBeenCalled();
  });
});