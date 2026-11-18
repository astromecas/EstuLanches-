const services = require('../src/services');
const { RegraDeNegocioError } = services;

describe('Testes Unitários - Regras de Negócio do EstuLanches', () => {

  test('calcularTotal: soma corretamente os itens do pedido', () => {
    const total = services.calcularTotal([[5.50, 2], [3.00, 1]]);
    expect(total).toBe(14.00);
  });

  test('calcularTotal: rejeita quantidade zero ou negativa', () => {
    expect(() => {
      services.calcularTotal([[5.00, 0]]);
    }).toThrow(RegraDeNegocioError);
  });

  test('validarItem: valida item com dados corretos', () => {
    const res = services.validarItem({ nome: ' Coxinha ', preco: '6.50' });
    expect(res).toEqual({ nome: 'Coxinha', preco: 6.50 });
  });

  // 5 casos de teste parametrizados para validação de item
  test.each([
    [{ nome: '', preco: 5.00 }],
    [{ nome: 'X', preco: 0 }],
    [{ nome: 'X', preco: -1 }],
    [{ nome: 'X', preco: 'abc' }],
    [{ nome: 'X' }]
  ])('validarItem: rejeita dados inválidos (%p)', (dados) => {
    expect(() => {
      services.validarItem(dados);
    }).toThrow(RegraDeNegocioError);
  });

  test('validarTransicao: permite transição válida (recebido -> em_preparo)', () => {
    expect(services.validarTransicao('recebido', 'em_preparo')).toBe(true);
  });

  // 5 casos de teste parametrizados para transições inválidas
  test.each([
    ['recebido', 'entregue'],
    ['entregue', 'cancelado'],
    ['cancelado', 'em_preparo'],
    ['pronto', 'recebido'],
    ['recebido', 'xyz']
  ])('validarTransicao: rejeita transição inválida de %s para %s', (atual, novo) => {
    expect(() => {
      services.validarTransicao(atual, novo);
    }).toThrow(RegraDeNegocioError);
  });

});
