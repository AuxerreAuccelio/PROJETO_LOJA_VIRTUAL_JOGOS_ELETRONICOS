const request = require('supertest');

const AMBIENTE_PADRAO = {
  LOGIN_MAX_TENTATIVAS: '100000',
  CORS_ORIGINS: undefined
};

// Recarrega a aplicação com variáveis diferentes (o módulo de segurança lê o ambiente ao carregar).
function carregarApp(variaveis = {}) {
  jest.resetModules();
  Object.assign(process.env, variaveis);
  const app = require('../src/app');
  const helpers = require('./helpers');
  helpers.prepararBanco();
  return app;
}

afterEach(() => {
  for (const [chave, valor] of Object.entries(AMBIENTE_PADRAO)) {
    if (valor === undefined) delete process.env[chave];
    else process.env[chave] = valor;
  }
});

describe('cabeçalhos de segurança (helmet)', () => {
  test('envia política de conteúdo e nosniff, e não revela o Express', async () => {
    const app = carregarApp();
    const res = await request(app).get('/api/saude');

    expect(res.status).toBe(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['content-security-policy']).toContain("script-src 'self' 'unsafe-inline'");
    expect(res.headers['content-security-policy']).toContain('https://fonts.gstatic.com');
    expect(res.headers['content-security-policy']).not.toContain('upgrade-insecure-requests');
  });
});

describe('CORS', () => {
  test('por padrão não libera nenhuma outra origem', async () => {
    const app = carregarApp();
    const res = await request(app).get('/api/jogos').set('Origin', 'http://evil.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('libera só as origens listadas em CORS_ORIGINS', async () => {
    const app = carregarApp({ CORS_ORIGINS: 'http://localhost:5173' });

    const aceita = await request(app).get('/api/jogos').set('Origin', 'http://localhost:5173');
    const recusada = await request(app).get('/api/jogos').set('Origin', 'http://evil.example');

    expect(aceita.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(recusada.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('limite do tamanho do corpo', () => {
  test('413 para corpo acima de 10 KB', async () => {
    const app = carregarApp();
    const res = await request(app).post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ nome: 'x'.repeat(20000) }));

    expect(res.status).toBe(413);
    expect(res.body.mensagem).toBe('Corpo da requisição grande demais');
  });
});

describe('limite de tentativas de login', () => {
  test('conta só as falhas e bloqueia a partir da 4ª quando o limite é 3', async () => {
    const app = carregarApp({ LOGIN_MAX_TENTATIVAS: '3' });
    const tentar = (senha) => request(app).post('/api/auth/login').send({ email: 'ana@teste.com', senha });

    for (let i = 0; i < 5; i++) expect((await tentar('senha12345')).status).toBe(200);
    for (let i = 0; i < 3; i++) expect((await tentar('errada12345')).status).toBe(401);

    const bloqueada = await tentar('errada12345');
    expect(bloqueada.status).toBe(429);
    expect(bloqueada.body.mensagem).toBe('Muitas tentativas. Tente novamente em alguns minutos.');

    // depois do bloqueio, até a senha certa é recusada por um tempo
    expect((await tentar('senha12345')).status).toBe(429);
    // o resto da API continua acessível
    expect((await request(app).get('/api/jogos')).status).toBe(200);
  });
});