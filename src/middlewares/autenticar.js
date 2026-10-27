const jwt = require('jsonwebtoken');
const db = require('../config/database');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Token não informado' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const mensagem = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ mensagem });
  }

  // Garante que o cliente ainda existe e está ativo
  const cliente = db
    .prepare('SELECT id_cliente, nome, email FROM CLIENTE WHERE id_cliente = ? AND ativo = 1')
    .get(payload.id_cliente);

  if (!cliente) {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }

  req.cliente = cliente;
  next();
}

module.exports = autenticar;