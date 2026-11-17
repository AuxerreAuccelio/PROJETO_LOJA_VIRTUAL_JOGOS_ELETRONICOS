# Cartucho Web (Fase 7)

Front-end React + Tailwind da loja, consumindo a API do backend.

## Rodar em desenvolvimento
1. Backend no ar: `node src/server.js` (porta 3000) na pasta do backend.
2. Nesta pasta: `npm install` e `npm run dev`. O Vite abre em http://localhost:5173 e encaminha `/api` para a porta 3000.

## Publicar junto com o Express
`npm run build` gera `dist/`. Copie o conteúdo de `dist/` para `public/` do backend (substitui o protótipo `index.html`).
O helmet já permite scripts da própria origem e as fontes do Google Fonts, então o build funciona sem mudar a política.

## Estrutura
- `src/index.css`: tema Tailwind com as cores e fontes da identidade (claro e escuro).
- `src/api.js`: cliente da API e token. `src/AuthContext.jsx`: login, cadastro e sessão.
- `src/components/`: Header, CardJogo, DetalheJogo (com avaliações), AuthDialog, Modal.

## Já cobre (paridade com o protótipo)
Vitrine com busca e filtros, detalhe, avaliações, login e cadastro com LGPD, modo escuro.

## Checkout (novo)
Carrinho no navegador (localStorage) > `POST /api/pedidos` > `POST /api/pedidos/:id/pagar` > Mercado Pago > retorno em `/?pedido=ID&pagamento=...` > `POST /api/pedidos/:id/confirmar`, que mostra o resultado e os códigos dos jogos digitais.

### Testar o pagamento
O backend exige `BASE_URL_PUBLICA` em https, e o sessionStorage é separado por endereço. Por isso, abra o front **pelo endereço do túnel https desde o início** (login incluído), e use esse mesmo endereço em `BASE_URL_PUBLICA`. Use credenciais e compradores de teste do Mercado Pago.

## Próximos passos da Fase 7
"Meus pedidos" (precisa de um endpoint de listagem no backend).
