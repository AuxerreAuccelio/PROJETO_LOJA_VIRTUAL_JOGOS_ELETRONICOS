// 3. Rotas de Jogos: src/routes/jogosRoutes.js
// Crie o arquivo src/routes/jogosRoutes.js:


//Este arquivo (src/routes/jogosRoutes.js) é a tabela de roteamento do recurso JOGO. A responsabilidade dele no padrão MVC é associar qual requisição HTTP 
// chega no servidor e qual função do Controller deve processá-la.

const express = require('express');  // const express = require('express'): Importa a biblioteca do Express para o arquivo.

const router = express.Router();    // const router = express.Router(): Cria um mini-roteador isolado do Express. 
                                    // Esse objeto router serve para agrupar e organizar rotas específicas de um mesmo recurso (neste caso, tudo relacionado a jogos) sem precisar poluir o server.js.

const jogosController = require('../controllers/jogosController');  // const jogosController = require(...): 
                    // Importa o módulo onde estão escritas as funções com a lógica de negócio e as consultas SQL ao banco de dados (o nosso jogosController).

// Mapeamento RESTful - 2. Mapeamento RESTful de Endpoints 
// Aqui é onde o padrão REST acontece na prática. Como no server.js este arquivo foi registrado na rota base /api/jogos (app.use('/api/jogos', jogosRoutes)), 
// o / nas declarações abaixo se refere a /api/jogos:

router.get('/', jogosController.listarTodos);   // Quando o cliente faz uma requisição GET para buscar todos os jogos, o roteador chama a função listarTodos do jogosController.
                                                // http://localhost:3000/api/jogos

router.get('/:id', jogosController.buscarPorId); // http://localhost:3000/api/jogos/1
                                                 // O :id é um parâmetro de rota dinâmico. O Express entende que qualquer valor passado após a barra (ex: /1, /42) é o 
                                                 // parâmetro id, que é enviado para a função buscarPorId do controlador.

router.post('/', jogosController.criar);  // http://localhost:3000/api/jogos
                                        // Usado para cadastrar/inserir um novo jogo no banco. Os dados do jogo são enviados no corpo da requisição (Request Body em formato JSON) 
                                        // e processados pela função criar.


router.put('/:id', jogosController.atualizar);  // http://localhost:3000/api/jogos/1
                                                // Usado para atualizar os dados de um jogo existente especificando o :id na URL e enviando as novas informações 
                                                // no corpo do JSON para a função atualizar.

router.delete('/:id', jogosController.deletar); // http://localhost:3000/api/jogos/1
                                                // Usado para desativar ou deletar o jogo do banco correspondente ao :id informado na URL, executando a função deletar.

module.exports = router; // Exporta essa configuração de rotas organizada para que o server.js possa importá-la e ativá-la com o comando app.use('/api/jogos', jogosRoutes).




