/**
 * Regras de negócio puras do EstuLanches (testáveis sem banco).
 */

const TRANSICOES = {
  recebido: ['em_preparo', 'cancelado'],
  em_preparo: ['pronto', 'cancelado'],
  pronto: ['entregue'],
  entregue: [],
  cancelado: []
};

class RegraDeNegocioError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RegraDeNegocioError';
    this.statusCode = 400;
  }
}

function validarItem(dados = {}) {
  const nome = (dados.nome || '').trim();
  if (!nome) {
    throw new RegraDeNegocioError('Nome é obrigatório.');
  }

  const precoNum = Number(dados.preco);
  if (dados.preco === undefined || dados.preco === null || isNaN(precoNum) || typeof dados.preco === 'string' && dados.preco.trim() === '' || isNaN(parseFloat(dados.preco))) {
    throw new RegraDeNegocioError('Preço inválido.');
  }

  if (precoNum <= 0) {
    throw new RegraDeNegocioError('Preço deve ser maior que zero.');
  }

  return {
    nome,
    preco: parseFloat(precoNum.toFixed(2))
  };
}

function calcularTotal(linhas = []) {
  let total = 0;

  for (const linha of linhas) {
    let preco = 0;
    let qtd = 0;

    if (Array.isArray(linha)) {
      preco = Number(linha[0]);
      qtd = Number(linha[1]);
    } else if (typeof linha === 'object' && linha !== null) {
      preco = Number(linha.preco_unitario !== undefined ? linha.preco_unitario : linha.preco);
      qtd = Number(linha.quantidade !== undefined ? linha.quantidade : linha.qtd);
    }

    if (isNaN(qtd) || qtd <= 0) {
      throw new RegraDeNegocioError('Quantidade deve ser maior que zero.');
    }

    if (isNaN(preco) || preco <= 0) {
      throw new RegraDeNegocioError('Preço inválido na linha.');
    }

    total += preco * qtd;
  }

  return parseFloat(total.toFixed(2));
}

function validarTransicao(atual, novo) {
  if (!TRANSICOES[novo]) {
    throw new RegraDeNegocioError(`Status desconhecido: ${novo}.`);
  }

  const permitidos = TRANSICOES[atual] || [];
  if (!permitidos.includes(novo)) {
    throw new RegraDeNegocioError(`Transição inválida: ${atual} -> ${novo}.`);
  }

  return true;
}

module.exports = {
  TRANSICOES,
  RegraDeNegocioError,
  validarItem,
  calcularTotal,
  validarTransicao
};
