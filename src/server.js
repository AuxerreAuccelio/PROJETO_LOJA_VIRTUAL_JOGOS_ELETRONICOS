require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

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



curl -X PUT http://localhost:3000/api/jogos/4 -H "Content-Type: application/json" -d "{\"preco\": 99.98}"

curl -X PUT http://localhost:3000/api/jogos/999 -H "Content-Type: application/json" -d "{\"preco\": 99.98}"



curl -X DELETE http://localhost:3000/api/jogos/4
curl -X DELETE http://localhost:3000/api/jogos/4
curl http://localhost:3000/api/jogos


cd Área\ de\ trabalho/Technologie/PROJETO_LOJA_VIRTUAL_JOGOS_ELETRONICOS/
sqlite3 loja.db "SELECT id_jogo, nome, ativo FROM JOGO;"






400
curl -X POST http://localhost:3000/api/jogos \
  -H "Content-Type: application/json" \
  -d '{"id_admin": 1, "nome": "Teste", "plataforma": "PC", "preco": "abc"}'


400
curl -X POST http://localhost:3000/api/jogos \
  -H "Content-Type: application/json" \
  -d '{"id_admin": 1, "nome": "Teste Passo 4", "preco": 59.90}'


201
curl -X POST http://localhost:3000/api/jogos \
  -H "Content-Type: application/json" \
  -d '{"id_admin": 1, "nome": "Teste Passo 4", "plataforma": "PC", "preco": 59.90}'





400
curl -i -X PUT http://localhost:3000/api/jogos/3 \
  -H "Content-Type: application/json" \
  -d '{"preco": -5}'


400
curl -i -X PUT http://localhost:3000/api/jogos/3 \
  -H "Content-Type: application/json" \
  -d '{}'




200
curl -i -X PUT http://localhost:3000/api/jogos/3 \
  -H "Content-Type: application/json" \
  -d '{"preco": 119.90}'




409
curl -i -X PUT http://localhost:3000/api/jogos/3 \
  -H "Content-Type: application/json" \
  -d '{"nome": "Cyberpunk 2077"}'  



400
curl -i http://localhost:3000/api/jogos/abc


400
curl -i http://localhost:3000/api/jogos/-1


400
curl -i http://localhost:3000/api/jogos/1.5



404
curl -i http://localhost:3000/api/jogos/9999


200
curl -i http://localhost:3000/api/jogos/1



404
curl -i http://localhost:3000/api/pedidos


400
curl -i -X POST http://localhost:3000/api/jogos \
  -H "Content-Type: application/json" \
  -d '{"nome": '



200
curl http://localhost:3000/api/jogos



201
curl -i -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome": "Ana Teste", "email": "ana@teste.com", "senha": "senha12345", "aceite_lgpd": true}'



409
curl -i -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome": "Ana Teste", "email": "ANA@teste.com", "senha": "senha12345", "aceite_lgpd": true}'



400
curl -i -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome": "Beto", "email": "beto@teste.com", "senha": "senha12345"}'



 400
 curl -i -X POST http://localhost:3000/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nome": "Beto", "email": "beto@teste.com", "senha": "123", "aceite_lgpd": true}' 



  
sqlite3 loja.db "SELECT id_cliente, email, substr(senha,1,7) AS inicio_senha, consentimento_lgpd_em FROM CLIENTE;"

│ id_cliente │      email       │ inicio_senha │   consentimento_lgp...   │
╞════════════╪══════════════════╪══════════════╪══════════════════════════╡
│          1 │ carlos@email.com │ $2a$12$      │ 2026-10-01 00:29:37      │
│          2 │ ana@email.com    │ $2a$12$      │ 2026-10-01 00:29:37      │
│          3 │ ana@teste.com    │ $2b$10$      │ 2026-10-09T22:21:31.844Z │
╰────────────┴──────────────────┴──────────────┴──────────────────────────  






*/