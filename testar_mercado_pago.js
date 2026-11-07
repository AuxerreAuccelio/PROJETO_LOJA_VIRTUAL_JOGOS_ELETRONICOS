const path = require('path');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function main() {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN ausente no .env');

  const base = process.env.BASE_URL_PUBLICA || 'https://example.com';
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

  const resposta = await new Preference(client).create({
    body: {
      items: [{ id: 'teste', title: 'Produto de Teste', quantity: 1, unit_price: 100, currency_id: 'BRL' }],
      back_urls: { success: `${base}/sucesso`, failure: `${base}/falha`, pending: `${base}/pendente` },
      auto_return: 'approved'
    }
  });

  console.log('Preferência criada. ID:', resposta.id);
  console.log('Link de pagamento:', resposta.init_point);
}

main().catch((e) => {
  console.error('Falhou:', e.cause?.code || e.message || e);
  process.exit(1);
});