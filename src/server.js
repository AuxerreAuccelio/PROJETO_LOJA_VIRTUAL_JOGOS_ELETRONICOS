const express = require('express');
const jogosRoutes = require('./routes/jogosRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Rota raiz de verificação
app.get('/', (req, res) => {
  res.json({ mensagem: "API da Loja Virtual de Jogos rodando com sucesso!" });
});

// Registrando as rotas do recurso JOGO
app.use('/api/jogos', jogosRoutes);

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});



// Como testar este Passo 1:
// 1. No terminal, inicie o servidor:

//      node src/server.js

// 2. Em outro terminal (ou no navegador), rode o curl:

// Teste os endpoints via curl ou no seu cliente de API (Postman / Thunder Client):

// Listar Jogos: curl http://localhost:3000/api/jogos

// Buscar Jogo 1: curl http://localhost:3000/api/jogos/1





/* 

Testes para introduzir um registro

curl -X POST http://localhost:3000/api/jogos \
  -H "Content-Type: application/json" \
  -d '{
    "id_admin": 1,
    "nome": "The Witcher 3",
    "plataforma": "PC",
    "genero": "RPG",
    "preco": 129.90,
    "tipo": "digital",
    "estoque": 50,
    "desenvolvedora": "CD Projekt Red",
    "descricao": "RPG de ação em mundo aberto."
  }'



  */