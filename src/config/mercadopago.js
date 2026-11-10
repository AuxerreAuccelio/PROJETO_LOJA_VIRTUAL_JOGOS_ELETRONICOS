const { MercadoPagoConfig, Preference } = require('mercadopago');

function criarCliente() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN ausente no .env');
  return new MercadoPagoConfig({ accessToken: token });
}

// Consulta, no Mercado Pago, os pagamentos de um pedido (o número do pedido é o external_reference).
async function buscarPagamentos(externalReference) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('MP_ACCESS_TOKEN ausente no .env');

  const url = new URL('https://api.mercadopago.com/v1/payments/search');
  url.searchParams.set('external_reference', String(externalReference));
  url.searchParams.set('sort', 'date_created');
  url.searchParams.set('criteria', 'desc');

  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000)
  });
  if (!r.ok) throw new Error(`Mercado Pago respondeu ${r.status}`);
  const dados = await r.json();
  return dados.results || [];
}

module.exports = { criarCliente, Preference, buscarPagamentos };
