const { z } = require('zod');

const registroSchema = z.object({
  nome: z.string().min(1).max(150),
  email: z.string().email().max(150),
  senha: z.string().min(8).max(72),
  aceite_lgpd: z.literal(true)
});

module.exports = { registroSchema };