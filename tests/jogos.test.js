const request = require('supertest');
const app = require('../src/app');
const { db, prepararBanco, inserirJogo, tokenAdmin, tokenCliente } = require('./helpers');

const admin = () => ({ Authorization: `Bearer ${tokenAdmin()}` });
const cliente = () => ({ Authorization: `Bearer ${tokenCliente()}` });
const novoJogo = (extra = {}) => ({ nome: 'Novo Jogo', plataforma: 'PC', preco: 59.9, ...extra });

beforeEach(() => {
  prepararBanco();
});

describe('GET /api/jogos', () => {
  test('lista só os jogos ativos', async () => {
    inserirJogo({ nome: 'Ativo' });
    inserirJogo({ nome: 'Desativado', ativo: 0 });

    const res = await request(app).get('/api/jogos');

    expect(res.status).toBe(200);
    expect(res.body.map(j => j.nome)).toEqual(['Ativo']);
  });
});

describe('GET /api/jogos/:id', () => {
  test('devolve o jogo ativo', async () => {
    const id = inserirJogo({ nome: 'Elden Ring' });
    const res = await request(app).get(`/api/jogos/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe('Elden Ring');
  });

  test('404 para jogo inexistente e para jogo desativado', async () => {
    const off = inserirJogo({ ativo: 0 });
    expect((await request(app).get('/api/jogos/9999')).status).toBe(404);
    expect((await request(app).get(`/api/jogos/${off}`)).status).toBe(404);
  });

  test.each(['abc', '-1', '1.5', '0'])('400 para id inválido: %s', async (id) => {
    const res = await request(app).get(`/api/jogos/${id}`);
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe('ID inválido');
  });
});

describe('POST /api/jogos (cadastro)', () => {
  test('401 sem token', async () => {
    const res = await request(app).post('/api/jogos').send(novoJogo());
    expect(res.status).toBe(401);
  });

  test('403 com token de cliente', async () => {
    const res = await request(app).post('/api/jogos').set(cliente()).send(novoJogo());
    expect(res.status).toBe(403);
  });

  test('201 com administrador, e o id_admin vem do token e não do corpo', async () => {
    const res = await request(app).post('/api/jogos').set(admin()).send(novoJogo({ id_admin: 99 }));

    expect(res.status).toBe(201);
    const gravado = db.prepare('SELECT * FROM JOGO WHERE id_jogo = ?').get(res.body.id_jogo);
    expect(gravado.id_admin).toBe(1);
    expect(gravado.tipo).toBe('digital');
    expect(gravado.estoque).toBe(0);
  });

  test.each([
    ['preço não numérico', { preco: 'abc' }, 'preco'],
    ['estoque negativo', { estoque: -5 }, 'estoque'],
    ['tipo inválido', { tipo: 'streaming' }, 'tipo'],
    ['nome vazio', { nome: '' }, 'nome']
  ])('400 para %s', async (_, extra, campo) => {
    const res = await request(app).post('/api/jogos').set(admin()).send(novoJogo(extra));
    expect(res.status).toBe(400);
    expect(res.body.erros.map(e => e.campo)).toContain(campo);
  });

  test('400 sem plataforma', async () => {
    const res = await request(app).post('/api/jogos').set(admin()).send({ nome: 'X', preco: 10 });
    expect(res.status).toBe(400);
    expect(res.body.erros.map(e => e.campo)).toContain('plataforma');
  });

  test('409 para o mesmo nome, plataforma e tipo, sem distinguir maiúsculas', async () => {
    await request(app).post('/api/jogos').set(admin()).send(novoJogo({ nome: 'Duplicado' }));
    const res = await request(app).post('/api/jogos').set(admin()).send(novoJogo({ nome: 'DUPLICADO' }));
    expect(res.status).toBe(409);
  });

  test('400 para JSON malformado', async () => {
    const res = await request(app).post('/api/jogos').set(admin())
      .set('Content-Type', 'application/json').send('{"nome": ');
    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe('JSON inválido no corpo da requisição');
  });
});

describe('PUT /api/jogos/:id (atualização)', () => {
  test('atualiza só o campo enviado e preserva os outros', async () => {
    const id = inserirJogo({ nome: 'Original', preco: 100, estoque: 7, tipo: 'fisico' });

    const res = await request(app).put(`/api/jogos/${id}`).set(admin()).send({ preco: 80 });

    expect(res.status).toBe(200);
    const g = db.prepare('SELECT * FROM JOGO WHERE id_jogo = ?').get(id);
    expect(g.preco).toBe(80);
    expect(g.nome).toBe('Original');
    expect(g.estoque).toBe(7);
    expect(g.tipo).toBe('fisico');
  });

  test('400 para corpo vazio e para preço negativo', async () => {
    const id = inserirJogo();
    expect((await request(app).put(`/api/jogos/${id}`).set(admin()).send({})).status).toBe(400);
    expect((await request(app).put(`/api/jogos/${id}`).set(admin()).send({ preco: -5 })).status).toBe(400);
  });

  test('409 ao renomear para um jogo que já existe', async () => {
    inserirJogo({ nome: 'Existente' });
    const id = inserirJogo({ nome: 'Outro' });
    const res = await request(app).put(`/api/jogos/${id}`).set(admin()).send({ nome: 'Existente' });
    expect(res.status).toBe(409);
  });

  test('404 para jogo inexistente', async () => {
    const res = await request(app).put('/api/jogos/9999').set(admin()).send({ preco: 10 });
    expect(res.status).toBe(404);
  });

  test('401 sem token e 403 com token de cliente', async () => {
    const id = inserirJogo();
    expect((await request(app).put(`/api/jogos/${id}`).send({ preco: 1 })).status).toBe(401);
    expect((await request(app).put(`/api/jogos/${id}`).set(cliente()).send({ preco: 1 })).status).toBe(403);
  });
});

describe('DELETE /api/jogos/:id (exclusão lógica)', () => {
  test('desativa sem apagar o registro; a segunda tentativa dá 404', async () => {
    const id = inserirJogo();

    const primeira = await request(app).delete(`/api/jogos/${id}`).set(admin());
    const segunda = await request(app).delete(`/api/jogos/${id}`).set(admin());

    expect(primeira.status).toBe(200);
    expect(segunda.status).toBe(404);
    const g = db.prepare('SELECT ativo FROM JOGO WHERE id_jogo = ?').get(id);
    expect(g.ativo).toBe(0);
  });

  test('401 sem token e 403 com cliente, e o jogo continua ativo', async () => {
    const id = inserirJogo();
    expect((await request(app).delete(`/api/jogos/${id}`)).status).toBe(401);
    expect((await request(app).delete(`/api/jogos/${id}`).set(cliente())).status).toBe(403);
    expect(db.prepare('SELECT ativo FROM JOGO WHERE id_jogo = ?').get(id).ativo).toBe(1);
  });
});

describe('Rotas e erros gerais', () => {
  test('rota inexistente devolve 404 em JSON', async () => {
    const res = await request(app).get('/api/nao-existe');
    expect(res.status).toBe(404);
    expect(res.body.mensagem).toBe('Rota não encontrada');
  });

  test('não revela que o servidor é Express', async () => {
    const res = await request(app).get('/api/saude');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
