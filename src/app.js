const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const services = require('./services');

const app = express();

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (fotos de lanches e documentos)
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use('/public/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use('/docs', express.static(path.join(__dirname, '..', 'docs')));

// Rota inicial: Interface Web do EstuLanches
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'visualizar.html'));
});

// Rotas da API
app.use('/', routes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  if (err instanceof services.RegraDeNegocioError || err.name === 'RegraDeNegocioError') {
    return res.status(err.statusCode || 400).json({ erro: err.message });
  }

  console.error('Erro interno:', err);
  return res.status(500).json({ erro: 'Erro interno no servidor.' });
});

module.exports = app;
