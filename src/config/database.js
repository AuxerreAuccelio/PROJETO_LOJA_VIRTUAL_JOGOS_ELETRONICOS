// 1. Conexão do Banco de Dados: src/config/database.js
// Será responsável por centralizar a conexão com o loja.db:

const Database = require('better-sqlite3'); //require('better-sqlite3'): Importa o driver do SQLite. Ele retorna uma classe (por isso a constante 
                                            // começa com letra maiúscula Database) usada para instanciar a conexão com o arquivo do banco.

const path = require('path');   //require('path'): Importa um módulo nativo do Node.js para manipular e resolver caminhos de arquivos e 
                                // diretórios no sistema operacional de forma compatível (seja Linux, Windows ou macOS).


// Caminho absoluto para o arquivo loja.db na raiz do projeto - 2. Construção do Caminho Dinâmico do Banco
const dbPath = path.resolve(__dirname, '..', '..', 'loja.db'); 
                                // __dirname: É uma variável global nativa do Node.js que devolve o caminho absoluto do diretório onde o 
                                // arquivo atual está salvo (neste caso, a pasta src/config/).

                                // '..', '..': Instrui o Node.js a "subir" dois níveis de pastas:
                                // O primeiro '..' sai de src/config/ e vai para src/. O segundo '..' sai de src/ e vai para a 
                                // pasta raiz do projeto (PROJETO_LOJA_VIRTUAL_JOGOS_ELETRONICOS/).

                                // 'loja.db': Especifica o nome do arquivo do banco de dados na raiz.

                                //path.resolve(...): Junta todas essas partes e gera um caminho absoluto completo e seguro no disco 
                                // (ex: /home/dev1n-alxelio/.../loja.db), evitando erros de "arquivo não encontrado" caso você execute o servidor de pastas diferentes no terminal.


const db = new Database(dbPath, { verbose: console.log });  //3. Criação da Conexão - new Database(dbPath, ...): Abre a conexão síncrona com o arquivo loja.db. Se o arquivo 
                                                            // não existisse, o better-sqlite3 o criaria automaticamente no local indicado.

                                                            // { verbose: console.log }: É uma opção de configuração útil para desenvolvimento. 
                                                            // Sempre que uma consulta SQL for executada pelo backend, a biblioteca imprimirá o comando SQL exato no terminal. Isso facilita muito a identificação de erros de query (debug).


module.exports = db;    // 4. Exportação do Módulo - Torna a instância de conexão db acessível para outros arquivos da aplicação.
                        // Assim, quando seus controllers precisarem fazer consultas SQL, basta importar essa mesma conexão usando 
                        // const db = require('../config/database');, garantindo que toda a aplicação reaproveite um único ponto de acesso ao banco (comando em outro arquivo).