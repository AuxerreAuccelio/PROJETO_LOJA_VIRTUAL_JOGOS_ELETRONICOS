const { z } = require('zod');

const jogoBase = z.object({
  id_admin: z.number().int().positive(),
  nome: z.string().min(1).max(200),
  plataforma: z.string().min(1).max(50),
  preco: z.number().min(0),
  tipo: z.enum(['digital', 'fisico']),
  estoque: z.number().int().min(0),
  genero: z.string().max(50).optional(),
  desenvolvedora: z.string().max(100).optional(),
  descricao: z.string().optional(),
  requisitos_sistema: z.string().optional(),
  data_lancamento: z.string().optional()
});


// Criar: aqui sim os defaults valem
const jogoSchema = jogoBase.extend({
  tipo: z.enum(['digital', 'fisico']).default('digital'),
  estoque: z.number().int().min(0).default(0)
});

const jogoUpdateSchema = jogoBase.omit({ id_admin: true }).partial();

module.exports = { jogoSchema, jogoUpdateSchema };