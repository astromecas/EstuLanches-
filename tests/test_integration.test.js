const request = require('supertest');
const app = require('../src/app');
const db = require('../src/db');

beforeAll(() => {
  // Ativar modo memória nos testes automatizados para execução ultrarrápida
  db.setMemoryFallback(true);
});

describe('Testes de Integração - API do EstuLanches', () => {

  test('GET /health: deve responder status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('POST e GET /cardapio: cadastro, duplicidade e listagem', async () => {
    // 1. Cadastrar item
    const resPost = await request(app)
      .post('/cardapio')
      .send({ nome: 'Suco de Uva', preco: 6.00, categoria: 'bebida' });
    expect(resPost.statusCode).toBe(201);
    expect(resPost.body.nome).toBe('Suco de Uva');

    // 2. Conflito por nome duplicado
    const resDup = await request(app)
      .post('/cardapio')
      .send({ nome: 'Suco de Uva', preco: 6.00 });
    expect(resDup.statusCode).toBe(409);

    // 3. Preço inválido
    const resInvalido = await request(app)
      .post('/cardapio')
      .send({ nome: 'Item Ruim', preco: -1 });
    expect(resInvalido.statusCode).toBe(400);

    // 4. Listagem
    const resGet = await request(app).get('/cardapio');
    expect(resGet.statusCode).toBe(200);
    expect(Array.isArray(resGet.body)).toBe(true);
  });

  test('PATCH /cardapio/:id: item indisponível não pode ser pedido', async () => {
    // Cadastrar item
    const itemRes = await request(app)
      .post('/cardapio')
      .send({ nome: 'Empada Especial', preco: 7.00 });
    const item = itemRes.body;

    // Desativar item
    await request(app)
      .patch(`/cardapio/${item.id}`)
      .send({ disponivel: false });

    // Tentar pedir item indisponível
    const pedidoRes = await request(app)
      .post('/pedidos')
      .send({
        aluno: 'Ana',
        itens: [{ item_id: item.id, quantidade: 1 }]
      });

    expect(pedidoRes.statusCode).toBe(400);
    expect(pedidoRes.body.erro).toContain('indisponível');
  });

  test('POST /pedidos e PATCH status: fluxo completo do pedido', async () => {
    const a = (await request(app).post('/cardapio').send({ nome: 'Pastel de Carne', preco: 8.00 })).body;
    const b = (await request(app).post('/cardapio').send({ nome: 'Chá Gelado', preco: 4.50 })).body;

    // Criar pedido
    const resPed = await request(app)
      .post('/pedidos')
      .send({
        aluno: 'Beatriz',
        itens: [
          { item_id: a.id, quantidade: 2 },
          { item_id: b.id, quantidade: 1 }
        ]
      });

    expect(resPed.statusCode).toBe(201);
    const pedido = resPed.body;
    expect(pedido.total).toBe(20.50);
    expect(pedido.status).toBe('recebido');

    // Avançar status: recebido -> em_preparo -> pronto -> entregue
    for (const st of ['em_preparo', 'pronto', 'entregue']) {
      const resSt = await request(app)
        .patch(`/pedidos/${pedido.id}/status`)
        .send({ status: st });
      expect(resSt.statusCode).toBe(200);
      expect(resSt.body.status).toBe(st);
    }

    // Transição inválida pós-entregue
    const resInvalida = await request(app)
      .patch(`/pedidos/${pedido.id}/status`)
      .send({ status: 'cancelado' });
    expect(resInvalida.statusCode).toBe(400);
  });

  test('POST /pedidos e GET /pedidos/:id: validações e 404', async () => {
    const resVazio = await request(app)
      .post('/pedidos')
      .send({ aluno: '', itens: [] });
    expect(resVazio.statusCode).toBe(400);

    const res404 = await request(app).get('/pedidos/99999');
    expect(res404.statusCode).toBe(404);
  });

});
