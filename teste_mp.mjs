import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configura o cliente utilizando a chave que está no seu .env
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

async function criarPreferenciaTeste() {
  try {
    const preference = new Preference(client);
    
    const resposta = await preference.create({
      body: {
        items: [
          {
            title: 'Produto de Teste (Jogo Eletrônico)',
            quantity: 1,
            unit_price: 100.00,
            currency_id: 'BRL'
          }
        ],
        back_urls: {
          success: `${process.env.BASE_URL_PUBLICA}/sucesso`,
          failure: `${process.env.BASE_URL_PUBLICA}/falha`,
          pending: `${process.env.BASE_URL_PUBLICA}/pendente`
        },
        auto_return: 'approved',
      }
    });

    console.log("Preferência criada com sucesso! ID:", resposta.id);
    console.log("Link de pagamento:", resposta.init_point);
  } catch (erro) {
    console.error("Erro ao criar preferência no Mercado Pago:", erro);
  }
}

criarPreferenciaTeste();