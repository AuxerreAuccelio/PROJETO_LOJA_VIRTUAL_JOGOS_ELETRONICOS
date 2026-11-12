const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

let criado = false;

// Cria o banco a partir do bancoDDL (uma vez por arquivo de teste) e recoloca os dados-base.
function prepararBanco() {
  if (!criado) {
    db.exec(fs.readFileSync(path.join(__dirname, '..', 'bancoDDL'), 'utf8'));
    criado = true;
  }

  db.exec(`
    DELETE FROM ITEM_PEDIDO; DELETE FROM PAGAMENTO; DELETE FROM PEDIDO;
    DELETE FROM CODIGO_ATIVACAO; DELETE FROM JOGO;
    DELETE FROM CLIENTE; DELETE FROM ADMINISTRADOR;
    DELETE FROM sqlite_sequence;
  `);

  db.prepare('INSERT INTO ADMINISTRADOR (nome, email, senha) VALUES (?, ?, ?)')
    .run('Admin Teste', 'admin@teste.com', bcrypt.hashSync('Admin12345', 4));
  db.prepare('INSERT INTO CLIENTE (nome, email, senha, consentimento_lgpd_em) VALUES (?, ?, ?, ?)')
    .run('Ana Teste', 'ana@teste.com', bcrypt.hashSync('senha12345', 4), new Date().toISOString());
}

function inserirJogo(dados = {}) {
  const j = {
    id_admin: 1, nome: 'Jogo de Teste', plataforma: 'PC', preco: 100,
    tipo: 'digital', estoque: 0, ativo: 1, ...dados
  };
  const r = db.prepare(`
    INSERT INTO JOGO (id_admin, nome, plataforma, preco, tipo, estoque, ativo)
    VALUES (@id_admin, @nome, @plataforma, @preco, @tipo, @estoque, @ativo)
  `).run(j);
  return Number(r.lastInsertRowid);
}

const assinar = (dados) => jwt.sign(dados, process.env.JWT_SECRET, { expiresIn: '1h' });
const tokenAdmin = () => assinar({ id_admin: 1, papel: 'admin' });
const tokenCliente = () => assinar({ id_cliente: 1 });

module.exports = { db, prepararBanco, inserirJogo, tokenAdmin, tokenCliente };
