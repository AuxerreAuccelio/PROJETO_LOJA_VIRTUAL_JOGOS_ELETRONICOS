const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { registroSchema, loginSchema } = require('../validations/authSchema');

// Esse é o OBJETO
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
  },

  login: (req, res) => {
    const resultado = loginSchema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        erros: resultado.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
      });
    }

    const { email, senha } = resultado.data;

    const cliente = db
      .prepare('SELECT id_cliente, nome, email, senha FROM CLIENTE WHERE email = ? AND ativo = 1')
      .get(email);

    // Mesma resposta para "e-mail não existe" e "senha errada"
    if (!cliente || !cliente.senha || !bcrypt.compareSync(senha, cliente.senha)) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign(
      { id_cliente: cliente.id_cliente },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso!',
      token,
      cliente: { id_cliente: cliente.id_cliente, nome: cliente.nome, email: cliente.email }
    });
  }


};

module.exports = authController;