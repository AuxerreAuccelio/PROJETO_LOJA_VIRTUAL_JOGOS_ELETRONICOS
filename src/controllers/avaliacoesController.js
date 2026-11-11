const db = require('../config/database');
const Avaliacao = require('../models/avaliacao');
const ErroNegocio = require('../utils/ErroNegocio');
const { avaliacaoSchema, consultaSchema } = require('../validations/avaliacaoSchema');

const respostaInvalida = (res, resultado, mensagem = 'Dados inválidos') =>
  res.status(400).json({
    mensagem,
    erros: resultado.error.issues.map(i => ({ campo: i.path.join('.'), problema: i.message }))
  });

// Mesmos status de pedido que o trigger do banco considera como compra concluída
const jaComprou = (id_cliente, id_jogo) =>
  !!db.prepare(`
    SELECT 1
    FROM PEDIDO p
    JOIN ITEM_PEDIDO i ON i.id_pedido = p.id_pedido
    WHERE p.id_cliente = ? AND i.id_jogo = ?
      AND p.status IN ('pago', 'enviado', 'entregue')
    LIMIT 1
  `).get(id_cliente, id_jogo);

const avaliacoesController = {
  criar: async (req, res) => {
    const id_jogo = Number(req.params.id);

    const resultado = avaliacaoSchema.safeParse(req.body);
    if (!resultado.success) return respostaInvalida(res, resultado);

    const jogo = db.prepare('SELECT 1 FROM JOGO WHERE id_jogo = ? AND ativo = 1').get(id_jogo);
    if (!jogo) throw new ErroNegocio(404, 'Jogo não encontrado');

    if (!jaComprou(req.cliente.id_cliente, id_jogo)) {
      throw new ErroNegocio(403, 'Somente quem comprou o jogo pode avaliá-lo');
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
    if (!consulta.success) return respostaInvalida(res, consulta, 'Parâmetros inválidos');

    const jogo = db.prepare('SELECT 1 FROM JOGO WHERE id_jogo = ? AND ativo = 1').get(id_jogo);
    if (!jogo) return res.status(404).json({ mensagem: 'Jogo não encontrado' });

    const { pagina, limite } = consulta.data;

    const [avaliacoes, resumo] = await Promise.all([
      Avaliacao.find({ id_jogo })
        .sort({ data: -1 })
        .skip((pagina - 1) * limite)
        .limit(limite)
        .select('-_id -id_cliente')
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