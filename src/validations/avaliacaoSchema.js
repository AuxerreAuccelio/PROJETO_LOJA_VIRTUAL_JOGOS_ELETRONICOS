const { z } = require('zod');

const avaliacaoSchema = z.object({
  nota: z.number().int().min(1).max(5),
  comentario: z.string().trim().max(1000).optional()
});

module.exports = { avaliacaoSchema };