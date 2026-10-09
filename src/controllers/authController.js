const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { registroSchema } = require('../validations/authSchema');

const authController = {
  registrar: (req, res) => {
    const resultado = registroSchema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        erros: resultado.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
      });
    }

    const { nome, email, senha } = resultado.data;

    const existente = db.prepare('SELECT 1 FROM CLIENTE WHERE email = ?').get(email);
    if (existente) {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado' });
    }

    const hash = bcrypt.hashSync(senha, 10);

    const result = db.prepare(`
      INSERT INTO CLIENTE (nome, email, senha, consentimento_lgpd_em)
      VALUES (?, ?, ?, ?)
    `).run(nome, email, hash, new Date().toISOString());

    res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!',
      id_cliente: result.lastInsertRowid,
      nome,
      email
    });
  }
};

module.exports = authController;