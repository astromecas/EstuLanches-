const express = require('express');
const router = express.Router();
const services = require('./services');
const db = require('./db');

// Health Check
router.get('/health', async (req, res) => {
  try {
    if (!db.useMemory()) {
      await db.getPool().query('SELECT 1');
    }
    return res.json({ status: 'ok', versao: process.env.APP_VERSION || '1.0.0' });
  } catch (err) {
    return res.status(500).json({ status: 'error', mensagem: err.message });
  }
});

// Cardápio: Listar
router.get('/cardapio', async (req, res, next) => {
  try {
    const soDisponiveis = req.query.disponivel === 'true';

    if (db.useMemory()) {
      let lista = db.memoryDB.cardapio;
      if (soDisponiveis) lista = lista.filter(i => i.disponivel);
      return res.json(lista);
    }

    const pool = db.getPool();
    let query = 'SELECT id, nome, preco::float, categoria, disponivel FROM itens_cardapio';
    if (soDisponiveis) query += ' WHERE disponivel = true';
    query += ' ORDER BY nome ASC';

    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Cardápio: Criar Item
router.post('/cardapio', async (req, res, next) => {
  try {
    const { nome, preco } = services.validarItem(req.body);
    const categoria = req.body.categoria || 'lanche';

    if (db.useMemory()) {
      const existe = db.memoryDB.cardapio.find(i => i.nome.toLowerCase() === nome.toLowerCase());
      if (existe) {
        return res.status(409).json({ erro: 'Item já existe.' });
      }
      const novo = {
        id: db.memoryDB.cardapio.length ? Math.max(...db.memoryDB.cardapio.map(i => i.id)) + 1 : 1,
        nome,
        preco,
        categoria,
        disponivel: true
      };
      db.memoryDB.cardapio.push(novo);
      return res.status(201).json(novo);
    }

    const pool = db.getPool();
    const existe = await pool.query('SELECT id FROM itens_cardapio WHERE LOWER(nome) = LOWER($1)', [nome]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ erro: 'Item já existe.' });
    }

    const result = await pool.query(
      'INSERT INTO itens_cardapio (nome, preco, categoria, disponivel) VALUES ($1, $2, $3, true) RETURNING id, nome, preco::float, categoria, disponivel',
      [nome, preco, categoria]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Cardápio: Atualizar
router.patch('/cardapio/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (db.useMemory()) {
      const item = db.memoryDB.cardapio.find(i => i.id === id);
      if (!item) return res.status(404).json({ erro: 'Item não encontrado.' });

      if (req.body.preco !== undefined) {
        const { preco } = services.validarItem({ nome: item.nome, preco: req.body.preco });
        item.preco = preco;
      }
      if (req.body.disponivel !== undefined) {
        item.disponivel = Boolean(req.body.disponivel);
      }
      return res.json(item);
    }

    const pool = db.getPool();
    const check = await pool.query('SELECT * FROM itens_cardapio WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ erro: 'Item não encontrado.' });
    }

    const item = check.rows[0];
    let novoPreco = item.preco;
    let novaDisp = item.disponivel;

    if (req.body.preco !== undefined) {
      const v = services.validarItem({ nome: item.nome, preco: req.body.preco });
      novoPreco = v.preco;
    }
    if (req.body.disponivel !== undefined) {
      novaDisp = Boolean(req.body.disponivel);
    }

    const updated = await pool.query(
      'UPDATE itens_cardapio SET preco = $1, disponivel = $2 WHERE id = $3 RETURNING id, nome, preco::float, categoria, disponivel',
      [novoPreco, novaDisp, id]
    );

    return res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Pedidos: Listar Todos
router.get('/pedidos', async (req, res, next) => {
  try {
    if (db.useMemory()) {
      return res.json(db.memoryDB.pedidos);
    }

    const pool = db.getPool();
    const pedidosRes = await pool.query('SELECT id, aluno, status, total::float, criado_em FROM pedidos ORDER BY id DESC');
    const pedidos = pedidosRes.rows;

    for (const p of pedidos) {
      const itensRes = await pool.query(
        'SELECT item_id, quantidade, preco_unitario::float FROM itens_pedido WHERE pedido_id = $1',
        [p.id]
      );
      p.itens = itensRes.rows;
    }

    return res.json(pedidos);
  } catch (err) {
    next(err);
  }
});

// Pedidos: Obter por ID
router.get('/pedidos/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    if (db.useMemory()) {
      const p = db.memoryDB.pedidos.find(x => x.id === id);
      if (!p) return res.status(404).json({ erro: 'Pedido não encontrado.' });
      return res.json(p);
    }

    const pool = db.getPool();
    const pRes = await pool.query('SELECT id, aluno, status, total::float, criado_em FROM pedidos WHERE id = $1', [id]);
    if (pRes.rows.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    const pedido = pRes.rows[0];
    const itensRes = await pool.query('SELECT item_id, quantidade, preco_unitario::float FROM itens_pedido WHERE pedido_id = $1', [id]);
    pedido.itens = itensRes.rows;

    return res.json(pedido);
  } catch (err) {
    next(err);
  }
});

// Pedidos: Criar
router.post('/pedidos', async (req, res, next) => {
  try {
    const aluno = (req.body.aluno || '').trim();
    const itensIn = req.body.itens || [];

    if (!aluno || !Array.isArray(itensIn) || itensIn.length === 0) {
      throw new services.RegraDeNegocioError('Informe aluno e ao menos um item.');
    }

    if (db.useMemory()) {
      const linhasCalculo = [];
      const itensPedido = [];

      for (const linha of itensIn) {
        const itemCardapio = db.memoryDB.cardapio.find(i => i.id === linha.item_id);
        if (!itemCardapio || !itemCardapio.disponivel) {
          throw new services.RegraDeNegocioError(`Item ${linha.item_id} indisponível.`);
        }
        const qtd = parseInt(linha.quantidade, 10);
        linhasCalculo.push([itemCardapio.preco, qtd]);
        itensPedido.push({
          item_id: itemCardapio.id,
          quantidade: qtd,
          preco_unitario: itemCardapio.preco
        });
      }

      const total = services.calcularTotal(linhasCalculo);
      const novoPedido = {
        id: db.memoryDB.pedidos.length ? Math.max(...db.memoryDB.pedidos.map(p => p.id)) + 1 : 101,
        aluno,
        status: 'recebido',
        total,
        itens: itensPedido
      };

      db.memoryDB.pedidos.unshift(novoPedido);
      return res.status(201).json(novoPedido);
    }

    const pool = db.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const linhasCalculo = [];
      const itensValidados = [];

      for (const linha of itensIn) {
        const itemRes = await client.query('SELECT id, preco::float, disponivel FROM itens_cardapio WHERE id = $1', [linha.item_id]);
        if (itemRes.rows.length === 0 || !itemRes.rows[0].disponivel) {
          throw new services.RegraDeNegocioError(`Item ${linha.item_id} indisponível.`);
        }
        const item = itemRes.rows[0];
        const qtd = parseInt(linha.quantidade, 10);
        linhasCalculo.push([item.preco, qtd]);
        itensValidados.push({ item_id: item.id, quantidade: qtd, preco_unitario: item.preco });
      }

      const total = services.calcularTotal(linhasCalculo);

      const pRes = await client.query(
        'INSERT INTO pedidos (aluno, status, total) VALUES ($1, $2, $3) RETURNING id, aluno, status, total::float, criado_em',
        [aluno, 'recebido', total]
      );
      const pedidoCriado = pRes.rows[0];

      for (const it of itensValidados) {
        await client.query(
          'INSERT INTO itens_pedido (pedido_id, item_id, quantidade, preco_unitario) VALUES ($1, $2, $3, $4)',
          [pedidoCriado.id, it.item_id, it.quantidade, it.preco_unitario]
        );
      }

      await client.query('COMMIT');
      pedidoCriado.itens = itensValidados;
      return res.status(201).json(pedidoCriado);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// Pedidos: Mudar Status
router.patch('/pedidos/:id/status', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const novoStatus = (req.body.status || '').trim();

    if (db.useMemory()) {
      const pedido = db.memoryDB.pedidos.find(p => p.id === id);
      if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado.' });

      services.validarTransicao(pedido.status, novoStatus);
      pedido.status = novoStatus;
      return res.json(pedido);
    }

    const pool = db.getPool();
    const pRes = await pool.query('SELECT id, aluno, status, total::float FROM pedidos WHERE id = $1', [id]);
    if (pRes.rows.length === 0) {
      return res.status(404).json({ erro: 'Pedido não encontrado.' });
    }

    const pedido = pRes.rows[0];
    services.validarTransicao(pedido.status, novoStatus);

    await pool.query('UPDATE pedidos SET status = $1 WHERE id = $2', [novoStatus, id]);
    pedido.status = novoStatus;
    return res.json(pedido);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
