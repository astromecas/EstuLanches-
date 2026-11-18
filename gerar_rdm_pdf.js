const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 36, bottom: 36, left: 40, right: 40 }
});

const outputPath = path.join(__dirname, 'docs', 'RDM.pdf');
const rootOutputPath = path.join(__dirname, 'RDM.pdf');

const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

const primary = '#1e3a8a';
const dark = '#0f172a';
const muted = '#475569';
const border = '#cbd5e1';
const success = '#059669';

// Cabeçalho Principal
doc.rect(40, 36, 515, 62).fill('#f8fafc').stroke(border);

doc.fillColor(primary).font('Helvetica-Bold').fontSize(14)
   .text('FICHA SIMPLIFICADA DE REGISTRO DE MUDANÇA (RDM)', 52, 46);

doc.fillColor(muted).font('Helvetica').fontSize(9)
   .text('Sistema: EstuLanches - Gestão de Cardápio e Pedidos da Cantina Escolar (Node.js)', 52, 64)
   .text('Ambiente: Produção (Docker Compose)   |   Classificação: Implantação Inicial', 52, 78);

doc.rect(430, 44, 115, 46).fill('#eff6ff').stroke('#bfdbfe');
doc.fillColor(primary).font('Helvetica-Bold').fontSize(10)
   .text('Nº RDM-2026-001', 435, 52, { width: 105, align: 'center' });
doc.fillColor(muted).font('Helvetica').fontSize(8)
   .text('Data: 18/11/2026', 435, 68, { width: 105, align: 'center' })
   .text('Resp: Técnico Impl.', 435, 78, { width: 105, align: 'center' });

// 1. Dados Gerais da Implantação
let y = 110;
doc.fillColor(primary).font('Helvetica-Bold').fontSize(10).text('1. DADOS GERAIS DA IMPLANTAÇÃO', 40, y);
doc.rect(40, y + 14, 515, 1).fill(border);

y += 20;
const dadosGerais = [
  ['Versão Implantada', '1.0.0 (Container: node:20-alpine | Banco: postgres:16-alpine)'],
  ['Data e Horário', '18/11/2026 das 08:00 às 08:30 (Janela de 30 minutos sem impacto)'],
  ['Tecnologias Utilizadas', 'Node.js, Express.js, PostgreSQL 16, Jest (Testes Automatizados)'],
  ['Tipo de Mudança', 'Implantação Inicial (First Deploy em ambiente produtivo)']
];

dadosGerais.forEach(([campo, valor]) => {
  doc.rect(40, y, 140, 18).fill('#f1f5f9').stroke(border);
  doc.rect(180, y, 375, 18).stroke(border);
  doc.fillColor(dark).font('Helvetica-Bold').fontSize(8.5).text(campo, 46, y + 5);
  doc.fillColor(dark).font('Helvetica').fontSize(8.5).text(valor, 186, y + 5);
  y += 18;
});

// 2. Parâmetros Alterados / Definidos
y += 12;
doc.fillColor(primary).font('Helvetica-Bold').fontSize(10).text('2. PARÂMETROS ALTERADOS E DEFINIDOS NO AMBIENTE', 40, y);
doc.rect(40, y + 14, 515, 1).fill(border);

y += 20;
doc.rect(40, y, 140, 16).fill('#e2e8f0').stroke(border);
doc.rect(180, y, 110, 16).fill('#e2e8f0').stroke(border);
doc.rect(290, y, 265, 16).fill('#e2e8f0').stroke(border);
doc.fillColor(dark).font('Helvetica-Bold').fontSize(8).text('PARÂMETRO', 46, y + 4);
doc.text('CONFIGURAÇÃO', 186, y + 4);
doc.text('JUSTIFICATIVA TÉCNICA / DIRETRIZ', 296, y + 4);
y += 16;

const params = [
  ['APP_PORT', '8000', 'Única porta exposta publicamente para os alunos e cantina'],
  ['Porta PostgreSQL', '5432 (Não exposta)', 'Acesso restrito exclusivamente à rede interna do Docker'],
  ['POSTGRES_PASSWORD', 'Definida em .env', 'Credenciais fortes isoladas do Git via .gitignore'],
  ['Volume de Dados', 'pgdata (persistente)', 'Garante preservação de cardápio e pedidos entre reinícios'],
  ['Política de Reinício', 'unless-stopped', 'Recuperação automática dos serviços em caso de falha'],
  ['Usuário do Container', 'node (não-root)', 'Execução sem privilégios de root (Conformidade DevSecOps)']
];

params.forEach(([p, val, obs]) => {
  doc.rect(40, y, 140, 16).stroke(border);
  doc.rect(180, y, 110, 16).stroke(border);
  doc.rect(290, y, 265, 16).stroke(border);
  doc.fillColor(dark).font('Helvetica-Bold').fontSize(8).text(p, 46, y + 4);
  doc.fillColor(dark).font('Helvetica').fontSize(8).text(val, 186, y + 4);
  doc.fillColor(muted).font('Helvetica').fontSize(8).text(obs, 296, y + 4);
  y += 16;
});

// 3. Resultado dos Testes de Validação
y += 12;
doc.fillColor(primary).font('Helvetica-Bold').fontSize(10).text('3. RESULTADO DOS TESTES DE VALIDAÇÃO', 40, y);
doc.rect(40, y + 14, 515, 1).fill(border);

y += 20;
doc.rect(40, y, 170, 16).fill('#e2e8f0').stroke(border);
doc.rect(210, y, 210, 16).fill('#e2e8f0').stroke(border);
doc.rect(420, y, 135, 16).fill('#e2e8f0').stroke(border);
doc.fillColor(dark).font('Helvetica-Bold').fontSize(8).text('VALIDAÇÃO EXECUTADA', 46, y + 4);
doc.text('ESCOPO DA VERIFICAÇÃO', 216, y + 4);
doc.text('STATUS FINAL', 426, y + 4);
y += 16;

const testes = [
  ['Testes Unitários (Jest)', '14 casos (totais, preços, regras e transições)', '[X] APROVADO (14/14)'],
  ['Testes de Integração (Supertest)', '5 casos (API Express, rotas, pedidos e cardápio)', '[X] APROVADO (5/5)'],
  ['docker compose ps', 'Verificação de estado dos containers e portas', '[X] OK (Healthy / Saudável)'],
  ['Auditoria de Logs', 'docker compose logs (ausência de erros críticos)', '[X] OK (Sem erros críticos)'],
  ['Smoke Tests nos Endpoints', 'Chamadas /health, /cardapio e /pedidos', '[X] OK (HTTP 200/201)']
];

testes.forEach(([t, esc, st]) => {
  doc.rect(40, y, 170, 16).stroke(border);
  doc.rect(210, y, 210, 16).stroke(border);
  doc.rect(420, y, 135, 16).fill('#f0fdf4').stroke(border);
  doc.fillColor(dark).font('Helvetica-Bold').fontSize(8).text(t, 46, y + 4);
  doc.fillColor(muted).font('Helvetica').fontSize(8).text(esc, 216, y + 4);
  doc.fillColor(success).font('Helvetica-Bold').fontSize(8).text(st, 426, y + 4);
  y += 16;
});

// 4. Plano de Contingência e Retorno (Rollback)
y += 10;
doc.fillColor(primary).font('Helvetica-Bold').fontSize(9.5).text('4. PLANO DE RETORNO (ROLLBACK)', 40, y);
y += 14;
doc.rect(40, y, 515, 26).fill('#f8fafc').stroke(border);
doc.fillColor(dark).font('Helvetica').fontSize(8)
   .text('Em caso de anomalia pós-implantação: executar "docker compose down" preservando o volume "pgdata" e realizar o redeploy da imagem estável anterior. Tempo de recuperação estimado: < 3 minutos.', 46, y + 5, { width: 503 });

// 5. Status Final da Implantação
y += 34;
doc.fillColor(primary).font('Helvetica-Bold').fontSize(9.5).text('5. STATUS FINAL DA IMPLANTAÇÃO', 40, y);
y += 14;
doc.rect(40, y, 515, 40).fill('#f0fdf4').stroke('#86efac');
doc.fillColor(success).font('Helvetica-Bold').fontSize(10)
   .text('[X] CONCLUÍDA COM SUCESSO    ( ) Concluída com ressalvas    ( ) Revertida', 48, y + 6);
doc.fillColor(dark).font('Helvetica').fontSize(7.5)
   .text('Parecer Técnico: O sistema EstuLanches v1.0.0 (Node.js/Express) foi implantado com êxito na infraestrutura Docker. Banco relacional PostgreSQL provisionado com volume persistente, healthchecks operacionais, segurança com usuário não-root node e 100% dos testes automatizados Jest aprovados. Sistema liberado para operação da cantina escolar.', 48, y + 19, { width: 500 });

// 6. Assinaturas e Aprovações
y += 48;
doc.rect(40, y, 250, 48).stroke(border);
doc.rect(305, y, 250, 48).stroke(border);

doc.moveTo(55, y + 28).lineTo(275, y + 28).stroke('#94a3b8');
doc.fillColor(dark).font('Helvetica-Bold').fontSize(8).text('Técnico de Implantação', 55, y + 32);
doc.fillColor(muted).font('Helvetica').fontSize(7.5).text('Executor  |  Data: 18/11/2026', 170, y + 32);

doc.moveTo(320, y + 28).lineTo(540, y + 28).stroke('#94a3b8');
doc.fillColor(dark).font('Helvetica-Bold').fontSize(8).text('Gestão de TI / Aprovador', 320, y + 32);
doc.fillColor(muted).font('Helvetica').fontSize(7.5).text('Aprovado  |  Data: 18/11/2026', 435, y + 32);

doc.end();

stream.on('finish', () => {
  fs.copyFileSync(outputPath, rootOutputPath);
  console.log('PDF gerado com sucesso em docs/RDM.pdf e RDM.pdf');
});
