const express = require('express');
const jogosRoutes = require('./routes/jogosRoutes');

const app = express();

const { rotaNaoEncontrada, tratadorDeErros } = require('./middlewares/errorHandler');



app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API da Loja Virtual de Jogos rodando com sucesso!' });
});

app.use('/api/jogos', jogosRoutes);



app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);



module.exports = app;