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

  // A ordem respeita as chaves estrangeiras (códigos e itens apontam para pedido e jogo)
  db.exec(`
    DELETE FROM CODIGO_ATIVACAO; DELETE FROM ITEM_PEDIDO; DELETE FROM PAGAMENTO;
    DELETE FROM PEDIDO; DELETE FROM JOGO;
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

function inserirCliente(nome = 'Outra Pessoa', email = 'outra@teste.com') {
  const r = db.prepare('INSERT INTO CLIENTE (nome, email, senha, consentimento_lgpd_em) VALUES (?, ?, ?, ?)')
    .run(nome, email, bcrypt.hashSync('senha12345', 4), new Date().toISOString());
  return Number(r.lastInsertRowid);
}

// Só para jogos digitais; o trigger do banco recalcula o estoque a partir dos códigos disponíveis
function inserirCodigos(id_jogo, codigos) {
  const ins = db.prepare('INSERT INTO CODIGO_ATIVACAO (id_jogo, codigo) VALUES (?, ?)');
  codigos.forEach(c => ins.run(id_jogo, c));
}

// itens: [{ id_jogo, quantidade, preco_unitario }]
function inserirPedido({ id_cliente = 1, status = 'aguardando_pagamento', itens }) {
  const centavos = itens.reduce((s, i) => s + Math.round(i.preco_unitario * 100) * i.quantidade, 0);
  const r = db.prepare('INSERT INTO PEDIDO (id_cliente, status, valor_total) VALUES (?, ?, ?)')
    .run(id_cliente, status, centavos / 100);
  const id = Number(r.lastInsertRowid);
  const ins = db.prepare('INSERT INTO ITEM_PEDIDO (id_pedido, id_jogo, quantidade, preco_unitario) VALUES (?, ?, ?, ?)');
  itens.forEach(i => ins.run(id, i.id_jogo, i.quantidade, i.preco_unitario));
  return id;
}

const assinar = (dados) => jwt.sign(dados, process.env.JWT_SECRET, { expiresIn: '1h' });
const tokenAdmin = () => assinar({ id_admin: 1, papel: 'admin' });
const tokenCliente = () => assinar({ id_cliente: 1 });

module.exports = {
  db, prepararBanco, inserirJogo, inserirCliente, inserirCodigos, inserirPedido, tokenAdmin, tokenCliente
};