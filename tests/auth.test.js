const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { db, prepararBanco, tokenAdmin } = require('./helpers');

const SEGREDO = () => process.env.JWT_SECRET;
const bearer = (token) => ({ Authorization: `Bearer ${token}` });
const dadosCadastro = (extra = {}) => ({
  nome: 'Beto Teste', email: 'beto@teste.com', senha: 'senha12345', aceite_lgpd: true, ...extra
});

beforeEach(() => {
  prepararBanco();
});

describe('POST /api/auth/registrar', () => {
  test('201: cria a conta, guarda hash e a data do consentimento, e não devolve a senha', async () => {
    const res = await request(app).post('/api/auth/registrar').send(dadosCadastro());

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ nome: 'Beto Teste', email: 'beto@teste.com' });
    expect(JSON.stringify(res.body)).not.toMatch(/senha/i);

    const c = db.prepare('SELECT * FROM CLIENTE WHERE email = ?').get('beto@teste.com');
    expect(c.senha).toMatch(/^\$2[aby]\$/);
    expect(c.senha).not.toContain('senha12345');
    expect(c.consentimento_lgpd_em).toBeTruthy();
    expect(c.ativo).toBe(1);
  });

  test('409 para o mesmo e-mail com outra caixa de letras', async () => {
    await request(app).post('/api/auth/registrar').send(dadosCadastro());
    const res = await request(app).post('/api/auth/registrar').send(dadosCadastro({ email: 'BETO@teste.com' }));
    expect(res.status).toBe(409);
    expect(res.body.mensagem).toBe('E-mail já cadastrado');
  });

  test.each([
    ['sem aceite dos termos', { aceite_lgpd: undefined }, 'aceite_lgpd'],
    ['aceite falso', { aceite_lgpd: false }, 'aceite_lgpd'],
    ['senha curta', { senha: '123' }, 'senha'],
    ['senha acima de 72 caracteres', { senha: 'a'.repeat(73) }, 'senha'],
    ['e-mail inválido', { email: 'sem-arroba' }, 'email'],
    ['nome vazio', { nome: '' }, 'nome']
  ])('400 para %s', async (_, extra, campo) => {
    const res = await request(app).post('/api/auth/registrar').send(dadosCadastro(extra));
    expect(res.status).toBe(400);
    expect(res.body.erros.map(e => e.campo)).toContain(campo);
  });
});

describe('POST /api/auth/login', () => {
  const login = (email, senha) => request(app).post('/api/auth/login').send({ email, senha });

  test('200: devolve token só com o id do cliente e os dados públicos', async () => {
    const res = await login('ana@teste.com', 'senha12345');

    expect(res.status).toBe(200);
    expect(res.body.cliente).toEqual({ id_cliente: 1, nome: 'Ana Teste', email: 'ana@teste.com' });
    const payload = jwt.verify(res.body.token, SEGREDO());
    expect(Object.keys(payload).sort()).toEqual(['exp', 'iat', 'id_cliente']);
  });

  test('aceita o e-mail com outra caixa de letras', async () => {
    expect((await login('ANA@TESTE.COM', 'senha12345')).status).toBe(200);
  });

  test('senha errada e e-mail inexistente dão a mesma resposta 401', async () => {
    const errada = await login('ana@teste.com', 'errada12345');
    const inexistente = await login('ninguem@teste.com', 'senha12345');

    expect(errada.status).toBe(401);
    expect(inexistente.status).toBe(401);
    expect(errada.body).toEqual(inexistente.body);
    expect(errada.body.mensagem).toBe('E-mail ou senha inválidos');
  });

  test('400 sem senha', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ana@teste.com' });
    expect(res.status).toBe(400);
    expect(res.body.erros.map(e => e.campo)).toContain('senha');
  });

  test('401 para conta desativada', async () => {
    db.prepare('UPDATE CLIENTE SET ativo = 0 WHERE id_cliente = 1').run();
    expect((await login('ana@teste.com', 'senha12345')).status).toBe(401);
  });

  test('401 para conta que só tem login Google (sem senha)', async () => {
    db.prepare(`INSERT INTO CLIENTE (nome, email, login_google, consentimento_lgpd_em)
                VALUES ('Gil', 'gil@teste.com', 'google-123', ?)`).run(new Date().toISOString());
    expect((await login('gil@teste.com', 'qualquer123')).status).toBe(401);
  });
});

describe('POST /api/auth/admin/login', () => {
  const loginAdmin = (email, senha) => request(app).post('/api/auth/admin/login').send({ email, senha });

  test('200: token com papel de administrador e sem senha na resposta', async () => {
    const res = await loginAdmin('admin@teste.com', 'Admin12345');

    expect(res.status).toBe(200);
    expect(res.body.admin).toEqual({ id_admin: 1, nome: 'Admin Teste', email: 'admin@teste.com' });
    const payload = jwt.verify(res.body.token, SEGREDO());
    expect(payload).toMatchObject({ id_admin: 1, papel: 'admin' });
    expect(payload.id_cliente).toBeUndefined();
  });

  test('401 para senha errada, e-mail inexistente e credencial de cliente', async () => {
    expect((await loginAdmin('admin@teste.com', 'errada123')).status).toBe(401);
    expect((await loginAdmin('nao@teste.com', 'Admin12345')).status).toBe(401);
    expect((await loginAdmin('ana@teste.com', 'senha12345')).status).toBe(401);
  });

  test('401 para administrador desativado', async () => {
    db.prepare('UPDATE ADMINISTRADOR SET ativo = 0').run();
    expect((await loginAdmin('admin@teste.com', 'Admin12345')).status).toBe(401);
  });
});

describe('GET /api/auth/perfil (middleware autenticar)', () => {
  const perfil = (headers = {}) => request(app).get('/api/auth/perfil').set(headers);

  test('200: devolve os dados da cliente logada, sem senha', async () => {
    const token = jwt.sign({ id_cliente: 1 }, SEGREDO(), { expiresIn: '1h' });
    const res = await perfil(bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.cliente).toEqual({ id_cliente: 1, nome: 'Ana Teste', email: 'ana@teste.com' });
  });

  test('401 sem token, e com cabeçalho que não é Bearer', async () => {
    const semToken = await perfil();
    expect(semToken.status).toBe(401);
    expect(semToken.body.mensagem).toBe('Token não informado');
    expect((await perfil({ Authorization: 'Token abc' })).status).toBe(401);
  });

  test('401 para token falso e para token assinado com outro segredo', async () => {
    expect((await perfil(bearer('abc.def.ghi'))).status).toBe(401);
    const forjado = jwt.sign({ id_cliente: 1 }, 'outro-segredo');
    const res = await perfil(bearer(forjado));
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe('Token inválido');
  });

  test('401 "Token expirado" para token vencido', async () => {
    const vencido = jwt.sign({ id_cliente: 1 }, SEGREDO(), { expiresIn: -10 });
    const res = await perfil(bearer(vencido));
    expect(res.status).toBe(401);
    expect(res.body.mensagem).toBe('Token expirado');
  });

  test('401 para token sem assinatura (algoritmo none)', async () => {
    const semAssinatura = jwt.sign({ id_cliente: 1 }, '', { algorithm: 'none' });
    expect((await perfil(bearer(semAssinatura))).status).toBe(401);
  });

  test('401 para cliente desativado, inexistente e para token de administrador', async () => {
    const token = jwt.sign({ id_cliente: 1 }, SEGREDO(), { expiresIn: '1h' });
    db.prepare('UPDATE CLIENTE SET ativo = 0 WHERE id_cliente = 1').run();
    expect((await perfil(bearer(token))).status).toBe(401);

    const fantasma = jwt.sign({ id_cliente: 999 }, SEGREDO(), { expiresIn: '1h' });
    expect((await perfil(bearer(fantasma))).status).toBe(401);

    expect((await perfil(bearer(tokenAdmin()))).status).toBe(401);
  });
});

describe('middleware exigirAdmin (testado pela rota POST /api/jogos)', () => {
  const tentar = (token) => request(app).post('/api/jogos').set(bearer(token)).send({});

  test('401 para token vencido, forjado ou sem assinatura', async () => {
    const vencido = jwt.sign({ id_admin: 1, papel: 'admin' }, SEGREDO(), { expiresIn: -10 });
    const forjado = jwt.sign({ id_admin: 1, papel: 'admin' }, 'outro-segredo');
    const semAssinatura = jwt.sign({ id_admin: 1, papel: 'admin' }, '', { algorithm: 'none' });

    expect((await tentar(vencido)).body.mensagem).toBe('Token expirado');
    expect((await tentar(forjado)).status).toBe(401);
    expect((await tentar(semAssinatura)).status).toBe(401);
  });

  test('403 para token válido sem o papel de administrador', async () => {
    const semPapel = jwt.sign({ id_admin: 1 }, SEGREDO(), { expiresIn: '1h' });
    expect((await tentar(semPapel)).status).toBe(403);
  });

  test('401 para administrador desativado ou inexistente', async () => {
    const inexistente = jwt.sign({ id_admin: 999, papel: 'admin' }, SEGREDO(), { expiresIn: '1h' });
    expect((await tentar(inexistente)).status).toBe(401);

    db.prepare('UPDATE ADMINISTRADOR SET ativo = 0').run();
    expect((await tentar(tokenAdmin())).status).toBe(401);
  });
});