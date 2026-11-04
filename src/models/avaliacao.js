const mongoose = require('mongoose');

const avaliacaoSchema = new mongoose.Schema(
  {
    id_jogo: { type: Number, required: true },
    id_cliente: { type: Number, required: true },
    autor: { type: String, required: true },
    nota: { type: Number, required: true, min: 1, max: 5 },
    comentario: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: { createdAt: 'data', updatedAt: false }, versionKey: false }
);

// Um cliente só pode avaliar cada jogo uma vez
avaliacaoSchema.index({ id_jogo: 1, id_cliente: 1 }, { unique: true });

module.exports = mongoose.model('Avaliacao', avaliacaoSchema, 'avaliacoes');