const express = require('express');
const jogosRoutes = require('./routes/jogosRoutes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensagem: 'API da Loja Virtual de Jogos rodando com sucesso!' });
});

app.use('/api/jogos', jogosRoutes);

module.exports = app;