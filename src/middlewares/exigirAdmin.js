const jwt = require('jsonwebtoken');
const db = require('../config/database');

function exigirAdmin(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Token não informado' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    const mensagem = err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return res.status(401).json({ mensagem });
  }

  if (payload.papel !== 'admin' || !payload.id_admin) {
    return res.status(403).json({ mensagem: 'Acesso restrito a administradores' });
  }

  const admin = db
    .prepare('SELECT id_admin, nome, email FROM ADMINISTRADOR WHERE id_admin = ? AND ativo = 1')
    .get(payload.id_admin);
  if (!admin) {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }

  req.admin = admin;
  next();
}

module.exports = exigirAdmin;