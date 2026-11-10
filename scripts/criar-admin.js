const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

const [nome, email, senha] = process.argv.slice(2);
if (!nome || !email || !senha || senha.length < 8) {
  console.error('Uso: node scripts/criar-admin.js "Nome" email senha (mínimo 8 caracteres)');
  process.exit(1);
}

const hash = bcrypt.hashSync(senha, 10);
const existente = db.prepare('SELECT id_admin FROM ADMINISTRADOR WHERE email = ?').get(email);

if (existente) {
  db.prepare('UPDATE ADMINISTRADOR SET senha = ?, nome = ?, ativo = 1 WHERE id_admin = ?').run(hash, nome, existente.id_admin);
  console.log('Administrador atualizado, id', existente.id_admin);
} else {
  const r = db.prepare('INSERT INTO ADMINISTRADOR (nome, email, senha) VALUES (?, ?, ?)').run(nome, email, hash);
  console.log('Administrador criado, id', r.lastInsertRowid);
}