const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = require('./app');
const { conectarMongo } = require('./config/mongo');

const PORT = process.env.PORT || 3000;

conectarMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha ao conectar no MongoDB:', err.message);
    process.exit(1);
  });





/*
SUBSTITUÍDO PELO CÓDIGO ACIMA APÓS A INSTALAÇÃO DO MONGODB 

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 3000;

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

*/




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




Teste para saber se a senha é: senha12345 devolvendo true

node -e "
const b = require('bcryptjs');
const db = require('better-sqlite3')('loja.db');
for (const c of db.prepare('SELECT email, senha FROM CLIENTE').all())
  console.log(c.email, b.compareSync('senha12345', c.senha));
"
carlos@email.com false
ana@email.com false
ana@teste.com true
demo@teste.com true
demo2@teste.com true
demo3@teste.com true
beto@teste.com true
carlos@teste.com true
danilo@teste.com true




401
curl -i http://localhost:3000/api/auth/perfil

401
curl -i http://localhost:3000/api/auth/perfil -H "Authorization: Bearer abc.def.ghi"

200
curl -i http://localhost:3000/api/auth/perfil -H "Authorization: Bearer $TOKEN"



401 Unauthorized {"mensagem":"Token inválido"}
sqlite3 loja.db "UPDATE CLIENTE SET ativo = 0 WHERE email = 'ana@teste.com';"
sqlite3 loja.db "SELECT id_cliente, email,  ativo FROM CLIENTE;"
curl -i http://localhost:3000/api/auth/perfil -H "Authorization: Bearer $TOKEN"




exemplo de inicialização do MongoDB
podman start mongo-local

node src/server.js




obter Token Novo
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ana@teste.com", "senha": "senha12345"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).token")


401 sem token
curl -i -X POST http://localhost:3000/api/jogos/1/avaliacoes \
  -H "Content-Type: application/json" -d '{"nota": 5}'



400
curl -i -X POST http://localhost:3000/api/jogos/1/avaliacoes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"nota": 6}'


404 jogo inexistente
curl -i -X POST http://localhost:3000/api/jogos/9999/avaliacoes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nota": 5}'


201
curl -i -X POST http://localhost:3000/api/jogos/1/avaliacoes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nota": 5, "comentario": "Obra-prima."}'
  
  
409 - você já avaliou esse jogo
curl -i -X POST http://localhost:3000/api/jogos/1/avaliacoes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nota": 4}'



Documento no MongoDB  
podman exec mongo-local mongosh loja_virtual --quiet --eval "db.avaliacoes.find().toArray()"


avaliacaoSchema só aceita nota e comentario - 201
curl -i -X POST http://localhost:3000/api/jogos/2/avaliacoes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nota": 4, "autor": "Hacker", "id_cliente": 1}'



400 - apontando nota decimal
curl -i -X POST http://localhost:3000/api/jogos/3/avaliacoes \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"nota": 4.5}'




sqlite3 loja.db "SELECT id_cliente, email, ativo FROM CLIENTE WHERE email = 'ana@teste.com';"
echo "$HASH" | cut -c1-7
sqlite3 loja.db "UPDATE CLIENTE SET senha = '$HASH' WHERE email = 'ana@teste.com';"
node -e "
const b = require('bcryptjs');
const db = require('better-sqlite3')('loja.db');
const c = db.prepare('SELECT senha FROM CLIENTE WHERE email = ?').get('ana@teste.com');
console.log('senha12345 confere:', b.compareSync('senha12345', c.senha));
"






*/