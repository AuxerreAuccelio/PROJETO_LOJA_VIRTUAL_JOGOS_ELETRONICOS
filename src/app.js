const path = require('path');

const express = require('express');
const jogosRoutes = require('./routes/jogosRoutes');

const app = express();

const { rotaNaoEncontrada, tratadorDeErros } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');

const avaliacoesRoutes = require('./routes/avaliacoesRoutes');

const pedidosRoutes = require('./routes/pedidosRoutes');


app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.json({ mensagem: 'API da Loja Virtual de Jogos rodando com sucesso!' });
});

app.use('/api/jogos', jogosRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/avaliacoes', avaliacoesRoutes);

app.use('/api/pedidos', pedidosRoutes);

app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);



module.exports = app;