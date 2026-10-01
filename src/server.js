// Passo 1: Configurar o Servidor Express e a Estrutura Básica da API
// ​Neste primeiro passo, vamos criar a estrutura inicial do projeto Node.js, 
// instalar as dependências necessárias (Express e SQLite) e deixar o servidor rodando na porta desejada com uma rota de teste inicial.

//​ 1. Estrutura de Pastas Sugerida

// ​Crie uma pasta para o seu projeto backend e organize-a da seguinte forma:


/*

        meu-backend-loja/

        ├── src/

        │   └── server.js

        ├── package.json

        └── loja.db  (o seu banco de dados SQLite já existente)


*/



// 2. Inicializando o Projeto e Instalando Dependências

// ​No terminal, dentro da pasta do projeto, execute:

//  npm init -y

//  npm install express sqlite3




// 3. Código Fonte: src/server.js

// ​Crie o arquivo src/server.js com o código abaixo para subir o servidor Express e testar a comunicação básica:



const express = require('express');

const database = require('better-sqlite3');

const path = require('path');



const app = express();

const PORT = process.env.PORT || 3000;



// Middleware para o Express entender JSON nas requisições

app.use(express.json());


// Conexão com o banco de dados loja.db
const dbPath = path.resolve(__dirname, '..', 'loja.db');
const db = new database(dbPath, { verbose: console.log });


// Rota de teste inicial para validar se o servidor está no ar

app.get('/', (req, res) => {

    res.json({ mensagem: "API da Loja rodando com sucesso!" });

});


// Rota de teste do Banco de Dados: Listar os 5 primeiros jogos
app.get('/api/jogos', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM JOGO ORDER BY preco DESC LIMIT 5');
        const jogos = stmt.all();
        res.json(jogos);
    } catch (error) {
        res.status(500).json({ erro: 'Erro ao buscar jogos no banco de dados', detalhe: error.message });
    }
});



// Iniciando o servidor

app.listen(PORT, () => {

    console.log(`Servidor rodando na porta ${PORT} (http://localhost:${PORT})`);

});




// Como testar este Passo 1:
// 1. No terminal, inicie o servidor:

//      node src/server.js

// 2. Em outro terminal (ou no navegador), rode o curl:

//      curl http://localhost:3000/api/jogos

/* 

O que esperar de resposta:
Se o DML foi inserido no loja.db, você receberá um JSON com a lista dos jogos.

Se retornar [] (uma lista vazia), significa apenas que a tabela JOGO ainda está sem dados, e bastará rodar o DML uma vez.

*/