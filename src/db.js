const { Pool } = require('pg');

let pool = null;
let useMemoryFallback = false;

// Banco em memória para desenvolvimento local sem PostgreSQL ativo
const memoryDB = {
  cardapio: [
    { id: 1, nome: 'Pão de Queijo Recheado', preco: 4.50, categoria: 'lanche', disponivel: true },
    { id: 2, nome: 'Suco Natural de Laranja 300ml', preco: 5.00, categoria: 'bebida', disponivel: true },
    { id: 3, nome: 'Coxinha de Frango Tradicional', preco: 6.50, categoria: 'lanche', disponivel: true },
    { id: 4, nome: 'Bolo de Cenoura com Chocolate', preco: 4.00, categoria: 'sobremesa', disponivel: true }
  ],
  pedidos: [
    {
      id: 101,
      aluno: 'Ana Clara (9º B)',
      status: 'em_preparo',
      total: 11.50,
      itens: [
        { item_id: 3, quantidade: 1, preco_unitario: 6.50 },
        { item_id: 2, quantidade: 1, preco_unitario: 5.00 }
      ]
    }
  ]
};

function getPool() {
  if (!pool && !useMemoryFallback) {
    const connectionString = process.env.DATABASE_URL || 
      `postgres://${process.env.POSTGRES_USER || 'estu'}:${process.env.POSTGRES_PASSWORD || 'estu'}@${process.env.DB_HOST || 'db'}:5432/${process.env.POSTGRES_DB || 'estulanches'}`;

    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 3000
    });

    pool.on('error', (err) => {
      console.warn('Aviso no pool do PostgreSQL:', err.message);
    });
  }
  return pool;
}

async function inicializarBanco(tentativas = 15, intervalo = 2000) {
  for (let i = 1; i <= tentativas; i++) {
    try {
      const p = getPool();
      await p.query('SELECT 1');
      console.log('Conexão com o banco PostgreSQL OK.');

      // Criar tabelas se não existirem
      await p.query(`
        CREATE TABLE IF NOT EXISTS itens_cardapio (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(80) NOT NULL UNIQUE,
          preco NUMERIC(8,2) NOT NULL,
          categoria VARCHAR(30) NOT NULL DEFAULT 'lanche',
          disponivel BOOLEAN NOT NULL DEFAULT true
        );

        CREATE TABLE IF NOT EXISTS pedidos (
          id SERIAL PRIMARY KEY,
          aluno VARCHAR(80) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'recebido',
          total NUMERIC(8,2) NOT NULL DEFAULT 0,
          criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS itens_pedido (
          id SERIAL PRIMARY KEY,
          pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
          item_id INTEGER NOT NULL REFERENCES itens_cardapio(id),
          quantidade INTEGER NOT NULL,
          preco_unitario NUMERIC(8,2) NOT NULL
        );
      `);

      // Inserir dados padrão se vazio
      const countRes = await p.query('SELECT count(*) FROM itens_cardapio');
      if (parseInt(countRes.rows[0].count) === 0) {
        await p.query(`
          INSERT INTO itens_cardapio (nome, preco, categoria, disponivel) VALUES
          ('Pão de Queijo Recheado', 4.50, 'lanche', true),
          ('Suco Natural de Laranja 300ml', 5.00, 'bebida', true),
          ('Coxinha de Frango Tradicional', 6.50, 'lanche', true),
          ('Bolo de Cenoura com Chocolate', 4.00, 'sobremesa', true)
        `);
      }

      console.log('Tabelas do EstuLanches prontas no PostgreSQL.');
      return true;
    } catch (err) {
      console.log(`Banco indisponível (${i}/${tentativas}): aguardando inicialização...`);
      if (i === tentativas) {
        console.warn('PostgreSQL não detectado localmente. Ativando modo memória para desenvolvimento.');
        useMemoryFallback = true;
        return false;
      }
      await new Promise(r => setTimeout(r, intervalo));
    }
  }
}

module.exports = {
  getPool,
  memoryDB,
  useMemory: () => useMemoryFallback,
  setMemoryFallback: (val) => { useMemoryFallback = val; },
  inicializarBanco
};
