const path = require('path');
const express = require('express');

const {
  helmetConfig, corsConfig, limiteGeral, limiteLogin, limiteCadastro
} = require('./config/seguranca');
const jogosRoutes = require('./routes/jogosRoutes');
const authRoutes = require('./routes/authRoutes');
const avaliacoesRoutes = require('./routes/avaliacoesRoutes');
const pedidosRoutes = require('./routes/pedidosRoutes');
const { rotaNaoEncontrada, tratadorDeErros } = require('./middlewares/errorHandler');

const app = express();

app.use(helmetConfig);
app.use(corsConfig);
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', limiteGeral);
app.use('/api/auth/login', limiteLogin);
app.use('/api/auth/admin/login', limiteLogin);
app.use('/api/auth/registrar', limiteCadastro);

app.use('/api/jogos', jogosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/avaliacoes', avaliacoesRoutes);
app.use('/api/pedidos', pedidosRoutes);

app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);

module.exports = app;