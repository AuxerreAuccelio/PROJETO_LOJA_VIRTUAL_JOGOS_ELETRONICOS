const { z } = require('zod');

const avaliacaoSchema = z.object({
  nota: z.number().int().min(1).max(5),
  comentario: z.string().trim().max(1000).optional()
});

/* O z.coerce converte o texto da URL (?limite=5) em número antes de validar. */
const consultaSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(50).default(10)
});

module.exports = { avaliacaoSchema, consultaSchema };

