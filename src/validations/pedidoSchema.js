const { z } = require('zod');

const pedidoSchema = z.object({
  itens: z
    .array(z.object({
      id_jogo: z.number().int().positive(),
      quantidade: z.number().int().min(1).max(10)
    }))
    .min(1)
    .max(20)
    .refine(l => new Set(l.map(i => i.id_jogo)).size === l.length, 'Jogo repetido na lista')
});

module.exports = { pedidoSchema };