// Ambiente isolado dos testes: banco em memória e segredos falsos.
// O arquivo .env NÃO é lido aqui, então nenhum segredo real é usado.
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';
process.env.JWT_SECRET = 'segredo-so-para-testes';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MP_ACCESS_TOKEN = 'TEST-token-falso';
process.env.BASE_URL_PUBLICA = 'https://exemplo.test';
process.env.LOGIN_MAX_TENTATIVAS = '100000';
process.env.CADASTRO_MAX = '100000';
process.env.API_MAX_REQUISICOES = '100000';
