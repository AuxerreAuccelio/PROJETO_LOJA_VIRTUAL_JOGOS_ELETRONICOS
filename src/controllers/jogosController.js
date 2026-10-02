// 2. Controlador de Jogos: src/controllers/jogosController.js
// Crie o arquivo src/controllers/jogosController.js. Aqui definiremos o CRUD do recurso JOGO:

const db = require('../config/database');

const jogosController = {
  // 1. Listar todos os jogos ativos
  listarTodos: (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM JOGO WHERE ativo = 1');
      const jogos = stmt.all();
      res.json(jogos);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar jogos', detalhe: error.message });
    }
  },

  // 2. Buscar um jogo por ID
  buscarPorId: (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('SELECT * FROM JOGO WHERE id_jogo = ? AND ativo = 1');
      const jogo = stmt.get(id);

      if (!jogo) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado' });
      }

      res.json(jogo);
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao buscar o jogo', detalhe: error.message });
    }
  },

  // 3. Cadastrar um novo jogo
  criar: (req, res) => {
    try {
      const {
        id_admin,
        nome,
        plataforma,
        genero,
        preco,
        tipo,
        estoque,
        desenvolvedora,
        descricao,
        requisitos_sistema,
        data_lancamento
      } = req.body;

      // Validação simples de campos obrigatórios
      if (!nome || !preco || !id_admin) {
        return res.status(400).json({ mensagem: 'Campos id_admin, nome e preco são obrigatórios' });
      }

      const stmt = db.prepare(`
        INSERT INTO JOGO (
          id_admin, nome, plataforma, genero, preco, tipo, estoque,
          desenvolvedora, descricao, requisitos_sistema, data_lancamento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        id_admin,
        nome,
        plataforma,
        genero,
        preco,
        tipo || 'digital',
        estoque || 0,
        desenvolvedora,
        descricao,
        requisitos_sistema,
        data_lancamento
      );

      res.status(201).json({
        mensagem: 'Jogo cadastrado com sucesso!',
        id_jogo: result.lastInsertRowid
      });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao cadastrar jogo', detalhe: error.message });
    }
  },

  // 4. Atualizar um jogo
  atualizar: (req, res) => {
    try {
      const { id } = req.params;
      const {
        nome,
        plataforma,
        genero,
        preco,
        tipo,
        estoque,
        desenvolvedora,
        descricao
      } = req.body;

      const stmt = db.prepare(`
        UPDATE JOGO
        SET nome = ?, plataforma = ?, genero = ?, preco = ?, tipo = ?, estoque = ?, desenvolvedora = ?, descricao = ?
        WHERE id_jogo = ? AND ativo = 1
      `);

      const result = stmt.run(nome, plataforma, genero, preco, tipo, estoque, desenvolvedora, descricao, id);

      if (result.changes === 0) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado para atualização' });
      }

      res.json({ mensagem: 'Jogo atualizado com sucesso!' });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao atualizar jogo', detalhe: error.message });
    }
  },

  // 5. Exclusão lógica (Desativar jogo)
  deletar: (req, res) => {
    try {
      const { id } = req.params;
      const stmt = db.prepare('UPDATE JOGO SET ativo = 0 WHERE id_jogo = ?');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado' });
      }

      res.json({ mensagem: 'Jogo desativado com sucesso!' });
    } catch (error) {
      res.status(500).json({ erro: 'Erro ao deletar jogo', detalhe: error.message });
    }
  }
};

module.exports = jogosController;