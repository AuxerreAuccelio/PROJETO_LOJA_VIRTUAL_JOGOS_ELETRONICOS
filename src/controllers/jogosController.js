// 2. Controlador de Jogos: src/controllers/jogosController.js
// Crie o arquivo src/controllers/jogosController.js. Aqui definiremos o CRUD do recurso JOGO:

const db = require('../config/database');
const { jogoSchema, jogoUpdateSchema } = require('../validations/jogoSchema');

const jogosController = {
  // 1. Listar todos os jogos ativos
  listarTodos: (req, res) => {
    
      const stmt = db.prepare('SELECT * FROM JOGO WHERE ativo = 1');
      const jogos = stmt.all();
      res.json(jogos);
    
  },

  // 2. Buscar um jogo por ID
  buscarPorId: (req, res) => {
    
      const { id } = req.params;
      const stmt = db.prepare('SELECT * FROM JOGO WHERE id_jogo = ? AND ativo = 1');
      const jogo = stmt.get(id);

      if (!jogo) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado' });
      }

      res.json(jogo);
 
  },

  // 3. Cadastrar um novo jogo
  criar: (req, res) => {
    
          const resultado = jogoSchema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        erros: resultado.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
      });
    }

    const {
      id_admin, nome, plataforma, genero, preco, tipo, estoque,
      desenvolvedora, descricao, requisitos_sistema, data_lancamento
    } = resultado.data;

      const stmt = db.prepare(`
        INSERT INTO JOGO (
          id_admin, nome, plataforma, genero, preco, tipo, estoque,
          desenvolvedora, descricao, requisitos_sistema, data_lancamento
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        id_admin,
        nome,
        plataforma ?? null,
        genero ?? null,
        preco,
        tipo ?? 'digital',
        estoque ?? 0,
        desenvolvedora ?? null,
        descricao ?? null,
        requisitos_sistema ?? null,
        data_lancamento ?? null
      );

      res.status(201).json({
        mensagem: 'Jogo cadastrado com sucesso!',
        id_jogo: result.lastInsertRowid
      });
        
  },

  // 4. Atualizar um jogo
  atualizar: (req, res) => {
    
      const { id } = req.params;
      const resultado = jogoUpdateSchema.safeParse(req.body);

      if (!resultado.success) {
        return res.status(400).json({
          mensagem: 'Dados inválidos',
          erros: resultado.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
        });
      }

      if (Object.keys(resultado.data).length === 0) {
        return res.status(400).json({ mensagem: 'Envie ao menos um campo para atualizar' });
      }

      const {
        nome, plataforma, genero, preco, tipo, estoque,
        desenvolvedora, descricao, requisitos_sistema, data_lancamento
      } = resultado.data;

      const stmt = db.prepare(`
      UPDATE JOGO SET
        nome = COALESCE(?, nome),
        plataforma = COALESCE(?, plataforma),
        genero = COALESCE(?, genero),
        preco = COALESCE(?, preco),
        tipo = COALESCE(?, tipo),
        estoque = COALESCE(?, estoque),
        desenvolvedora = COALESCE(?, desenvolvedora),
        descricao = COALESCE(?, descricao),
        requisitos_sistema = COALESCE(?, requisitos_sistema),
        data_lancamento = COALESCE(?, data_lancamento)
      WHERE id_jogo = ? AND ativo = 1
    `);

      const result = stmt.run(nome ?? null, plataforma ?? null, genero ?? null, preco ?? null, tipo ?? null, estoque ?? null, desenvolvedora ?? null, descricao ?? null, requisitos_sistema ?? null,
      data_lancamento ?? null, id);

      if (result.changes === 0) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado para atualização' });
      }

      res.json({ mensagem: 'Jogo atualizado com sucesso!' });
    
  },

  // 5. Exclusão lógica (Desativar jogo)
  deletar: (req, res) => {
   
      const { id } = req.params;
      const stmt = db.prepare('UPDATE JOGO SET ativo = 0 WHERE id_jogo = ? AND ativo = 1');
      const result = stmt.run(id);

      if (result.changes === 0) {
        return res.status(404).json({ mensagem: 'Jogo não encontrado' });
      }

      res.json({ mensagem: 'Jogo desativado com sucesso!' });
    
  }
};

module.exports = jogosController;