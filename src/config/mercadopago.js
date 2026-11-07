const { MercadoPagoConfig, Preference } = require('mercadopago');

function criarCliente() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN ausente no .env');
  return new MercadoPagoConfig({ accessToken: token });
}

module.exports = { criarCliente, Preference };