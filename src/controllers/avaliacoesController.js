const db = require('../config/database');
const Avaliacao = require('../models/avaliacao');
const { avaliacaoSchema, consultaSchema } = require('../validations/avaliacaoSchema');

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
  },

    listar: async (req, res) => {
    const id_jogo = Number(req.params.id);

    const consulta = consultaSchema.safeParse(req.query);
    if (!consulta.success) {
      return res.status(400).json({
        mensagem: 'Parâmetros inválidos',
        erros: consulta.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
      });
    }

    const jogo = db.prepare('SELECT 1 FROM JOGO WHERE id_jogo = ? AND ativo = 1').get(id_jogo);
    if (!jogo) {
      return res.status(404).json({ mensagem: 'Jogo não encontrado' });
    }

    const { pagina, limite } = consulta.data;

    const [avaliacoes, resumo] = await Promise.all([
      Avaliacao.find({ id_jogo })
        .sort({ data: -1 })
        .skip((pagina - 1) * limite)
        .limit(limite)
        .select('-_id -id_cliente') // O select('-_id -id_cliente') deixa de fora os identificadores internos: o público vê só autor, nota, comentário e data.
        .lean(),
      Avaliacao.aggregate([
        { $match: { id_jogo } },
        { $group: { _id: null, media: { $avg: '$nota' }, total: { $sum: 1 } } }
      ])
    ]);

    const total = resumo[0]?.total ?? 0;
    const media = total ? Math.round(resumo[0].media * 10) / 10 : null;

    res.json({ id_jogo, media, total, pagina, limite, avaliacoes });
  },


    resumo: async (req, res) => {
    const dados = await Avaliacao.aggregate([
      { $group: { _id: '$id_jogo', media: { $avg: '$nota' }, total: { $sum: 1 } } }
    ]);

    const resumo = {};
    for (const d of dados) {
      resumo[d._id] = { media: Math.round(d.media * 10) / 10, total: d.total };
    }

    res.json(resumo);
  }



};

module.exports = avaliacoesController;