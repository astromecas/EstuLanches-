require('dotenv').config();
const app = require('./app');
const db = require('./db');

const BASE_PORT = parseInt(process.env.APP_PORT || process.env.PORT || '8000', 10);

async function start() {
  console.log(`Iniciando EstuLanches v${process.env.APP_VERSION || '1.0.0'}...`);
  await db.inicializarBanco();
  tentarOuvir(BASE_PORT);
}

function tentarOuvir(porta) {
  const server = app.listen(porta, '0.0.0.0');

  server.once('listening', () => {
    console.log(`\n=========================================`);
    console.log(`  EstuLanches rodando com sucesso!`);
    console.log(`  Ambiente: Node.js / Express`);
    console.log(`  Acesse no navegador: http://localhost:${porta}`);
    console.log(`=========================================\n`);
  });

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const proximaPorta = porta + 1;
      console.log(`Aviso: Porta ${porta} ocupada. Tentando automaticamente porta ${proximaPorta}...`);
      server.close();
      tentarOuvir(proximaPorta);
    } else {
      console.error('Erro ao iniciar servidor:', err);
    }
  });
}

start();
