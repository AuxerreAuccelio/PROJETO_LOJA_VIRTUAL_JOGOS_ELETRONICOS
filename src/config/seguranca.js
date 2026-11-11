const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Cabeçalhos de segurança. A política de conteúdo permite os scripts e estilos
// da vitrine de demonstração e as fontes do Google Fonts.
const helmetConfig = helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'script-src': ["'self'", "'unsafe-inline'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'upgrade-insecure-requests': null
    }
  }
});

// CORS: só origens listadas em CORS_ORIGINS (separadas por vírgula).
// Vazio = só a própria origem (a vitrine servida por este servidor).
const origens = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const corsConfig = cors({
  origin: origens.length ? origens : false,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600
});

const base = { standardHeaders: 'draft-7', legacyHeaders: false };
const mensagem = { mensagem: 'Muitas tentativas. Tente novamente em alguns minutos.' };

// Só tentativas que falham contam: login correto não gasta o limite.
const limiteLogin = rateLimit({
  ...base, message: mensagem, skipSuccessfulRequests: true,
  windowMs: 15 * 60 * 1000, limit: Number(process.env.LOGIN_MAX_TENTATIVAS) || 10
});

const limiteCadastro = rateLimit({
  ...base, message: mensagem,
  windowMs: 60 * 60 * 1000, limit: Number(process.env.CADASTRO_MAX) || 20
});

const limiteGeral = rateLimit({
  ...base, message: mensagem,
  windowMs: 15 * 60 * 1000, limit: Number(process.env.API_MAX_REQUISICOES) || 600
});

module.exports = { helmetConfig, corsConfig, limiteLogin, limiteCadastro, limiteGeral };
