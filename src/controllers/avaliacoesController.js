const db = require('../config/database');
const Avaliacao = require('../models/avaliacao');
const { avaliacaoSchema } = require('../validations/avaliacaoSchema');

const avaliacoesController = {
  criar: async (req, res) => {
    const id_jogo = req.params.id;

    const resultado = avaliacaoSchema.safeParse(req.body);
    if (!resultado.success) {
      return res.status(400).json({
        mensagem: 'Dados inválidos',
        erros: resultado.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
      });
    }

    const jogo = db.prepare('SELECT 1 FROM JOGO WHERE id_jogo = ? AND ativo = 1').get(id_jogo);
    if (!jogo) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado' });
    }

    const { nota, comentario } = resultado.data;
    const avaliacao = await Avaliacao.create({
      id_jogo,
      id_cliente: req.cliente.id_cliente,
      autor: req.cliente.nome,
      nota,
      comentario
    });

    res.status(201).json({ mensagem: 'Avaliação registrada com sucesso!', avaliacao });
  }
};

module.exports = avaliacoesController;