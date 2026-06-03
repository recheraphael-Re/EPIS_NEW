// ============================================================
// Gerador do PDF da Atividade Prática (SafeEPI) — jsPDF
// Uso: node docs/gerar-atividade-pdf.mjs
// ============================================================
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));

// ---- dados do aluno ----
const ALUNO = {
  nome: 'Raphael Gouvêa Reche',
  matricula: '26164063',
  github: 'https://github.com/recheraphael-Re/EPIS_NEW',
  deploy: 'https://epis-new-bpyu.vercel.app/',
};

// ---- cores ----
const NAVY = [30, 58, 95];
const ORANGE = [249, 115, 22];
const GRAY = [71, 85, 105];
const TEXT = [26, 26, 26];

// ---- sanitiza unicode -> Latin-1 (fontes padrão do jsPDF) ----
const sane = (s) =>
  String(s)
    .replace(/—/g, '-')   // — em dash
    .replace(/–/g, '-')   // – en dash
    .replace(/−/g, '-')   // − minus
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/…/g, '...')
    .replace(/├/g, '|')   // box-drawing -> ASCII
    .replace(/└/g, '`')
    .replace(/│/g, '|')
    .replace(/─/g, '-');

// ---- helper de imagem PNG: lê dimensões do IHDR ----
function pngInfo(path) {
  const buf = readFileSync(path);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return { dataUrl: 'data:image/png;base64,' + buf.toString('base64'), w, h };
}

const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
const PW = 210, PH = 297, M = 18, CW = PW - 2 * M;
let y = M;

function ensure(h) {
  if (y + h > PH - M) { doc.addPage(); y = M; }
}
function h2(txt) {
  ensure(16);
  y += 4;
  doc.setFont('helvetica', 'bold').setFontSize(14).setTextColor(...NAVY);
  doc.text(sane(txt), M, y);
  y += 2;
  doc.setDrawColor(...ORANGE).setLineWidth(0.6).line(M, y, M + CW, y);
  y += 6;
}
function h3(txt) {
  ensure(10);
  y += 2;
  doc.setFont('helvetica', 'bold').setFontSize(11.5).setTextColor(194, 87, 11);
  doc.text(sane(txt), M, y);
  y += 5;
}
function para(txt, opts = {}) {
  const size = opts.size || 10.5;
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal').setFontSize(size).setTextColor(...(opts.color || TEXT));
  const lines = doc.splitTextToSize(sane(txt), opts.w || CW);
  lines.forEach((ln) => {
    ensure(size * 0.42 + 1.5);
    doc.text(ln, opts.x || M, y);
    y += size * 0.42 + 1.5;
  });
  y += opts.gap ?? 2;
}
function bullets(items) {
  doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(...TEXT);
  items.forEach((it) => {
    const lines = doc.splitTextToSize(sane(it), CW - 6);
    lines.forEach((ln, i) => {
      ensure(5);
      if (i === 0) doc.text('•', M + 1, y);
      doc.text(ln, M + 6, y);
      y += 4.6;
    });
  });
  y += 2;
}
function frase(txt) {
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...NAVY);
  const lines = doc.splitTextToSize(sane(txt), CW - 12);
  const boxH = lines.length * 5.2 + 8;
  ensure(boxH + 2);
  doc.setFillColor(239, 246, 255).rect(M, y, CW, boxH, 'F');
  doc.setFillColor(...NAVY).rect(M, y, 1.6, boxH, 'F');
  let ty = y + 7;
  lines.forEach((ln) => { doc.text(ln, M + 6, ty); ty += 5.2; });
  y += boxH + 4;
}
function tree(txt) {
  const lines = sane(txt).split('\n');
  doc.setFont('courier', 'normal').setFontSize(8.2).setTextColor(51, 65, 85);
  const boxH = lines.length * 3.6 + 6;
  ensure(boxH + 2);
  doc.setFillColor(248, 250, 252).setDrawColor(226, 232, 240).setLineWidth(0.2);
  doc.rect(M, y, CW, boxH, 'FD');
  let ty = y + 5;
  lines.forEach((ln) => { doc.text(ln, M + 4, ty); ty += 3.6; });
  y += boxH + 4;
}
function image(path, caption) {
  const { dataUrl, w, h } = pngInfo(join(DIR, path));
  let drawW = Math.min(CW, 170);
  let drawH = (h / w) * drawW;
  const maxH = PH - 2 * M - 12;
  if (drawH > maxH) { drawH = maxH; drawW = (w / h) * drawH; }
  ensure(drawH + 8);
  const x = M + (CW - drawW) / 2;
  doc.setDrawColor(226, 232, 240).setLineWidth(0.2).rect(x, y, drawW, drawH);
  doc.addImage(dataUrl, 'PNG', x, y, drawW, drawH);
  y += drawH + 3;
  if (caption) {
    doc.setFont('helvetica', 'italic').setFontSize(8.5).setTextColor(...GRAY);
    doc.text(sane(caption), M, y);
    y += 5;
  }
}
function field(label, value) {
  ensure(8);
  doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(...TEXT);
  doc.text(sane(label), M, y);
  const lw = doc.getTextWidth(sane(label)) + 2;
  doc.setFont('helvetica', 'normal');
  if (value) doc.text(sane(value), M + lw, y);
  doc.setDrawColor(148, 163, 184).setLineWidth(0.2).line(M + lw, y + 1, M + CW, y + 1);
  y += 8;
}

// ===================== CAPA =====================
doc.setFillColor(...NAVY).rect(0, 0, PW, 52, 'F');
doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(255, 255, 255);
doc.text('Atividade Prática - Sistema de Gestão de EPIs', M, 24, { maxWidth: CW });
doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(226, 232, 240);
doc.text(sane('Planejamento, Análise e Design de Software - Solução: SafeEPI'), M, 36);
doc.setFontSize(9.5).setTextColor(203, 213, 225);
doc.text(sane('SENAI SC - Joinville Sul · Engenharia de Software · Profª. Mestra Tatiana Aparecida de Almeida · Período: 2026'), M, 45, { maxWidth: CW });
y = 62;
doc.setDrawColor(...ORANGE).setFillColor(255, 247, 237).setLineWidth(0.3);
doc.rect(M, y, CW, 20, 'FD');
doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(...NAVY);
doc.text(sane(`Aluno: ${ALUNO.nome}`), M + 4, y + 8);
doc.setFont('helvetica', 'normal').setTextColor(...TEXT);
doc.text(sane(`Matrícula: ${ALUNO.matricula}`), M + 4, y + 15);
y += 28;

// ===================== ETAPA 1 =====================
h2('Etapa 1 - Planejamento');
h3('4.1 Contextualização do Problema');
para('Situação atual: No SENAI SC Joinville Sul, o controle de EPIs é feito de forma manual, com planilhas de papel e registros avulsos. Cada entrega de equipamento a funcionários e visitantes é anotada à mão, sem um sistema central que relacione o equipamento, a pessoa, a data e o responsável. O estoque é conferido visualmente, sem atualização automática quando um EPI é entregue ou devolvido, e não há acompanhamento das validades (CA e do próprio equipamento).');
para('Principais problemas identificados:', { bold: true, gap: 1 });
bullets([
  'Registros em papel sujeitos a perda, rasura e extravio.',
  'Demora e dificuldade para localizar informações.',
  'Falta de rastreabilidade: não se sabe quem está com cada EPI no momento.',
  'Estoque sem controle em tempo real, gerando falta ou excesso de itens.',
  'Risco de segurança por entrega de EPI vencido ou ausência de controle.',
  'Reposição reativa, sem alerta de estoque mínimo.',
  'Ausência de relatórios para decisão gerencial.',
]);
h3('4.2 Definição do Problema');
frase('O controle manual de EPIs no SENAI Joinville Sul, baseado em planilhas de papel, impede a rastreabilidade de quem está com cada equipamento e o controle do estoque e das validades em tempo real, comprometendo a segurança dos usuários e a eficiência operacional.');
h3('4.3 Identificação dos Usuários');
autoTable(doc, {
  startY: y,
  margin: { left: M, right: M },
  head: [['Perfil', 'Papel no sistema']],
  body: [
    ['Administrador (almoxarife / gestor de segurança)', 'Cadastra EPIs, funcionários e setores; gerencia estoque (entradas/baixas); acessa tudo.'],
    ['Usuário operacional', 'Registra entregas e devoluções, consulta EPIs em posse e gera relatórios.'],
    ['Funcionário / Visitante', 'Recebe os EPIs e assina o recibo digital (não acessa o sistema diretamente).'],
    ['Gestão / Coordenação', 'Consome dashboard e relatórios para decisão.'],
  ].map((r) => r.map(sane)),
  styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 2, textColor: TEXT, lineColor: [203, 213, 225], lineWidth: 0.1 },
  headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
  columnStyles: { 0: { cellWidth: 58, fontStyle: 'bold' } },
});
y = doc.lastAutoTable.finalY + 4;

// ===================== ETAPA 2 =====================
h2('Etapa 2 - Análise de Requisitos');
h3('5.1 Requisitos Funcionais');
autoTable(doc, {
  startY: y, margin: { left: M, right: M },
  head: [['Código', 'Descrição']],
  body: [
    ['RF01', 'O sistema deve permitir o cadastro de EPIs com nome, CA, validade do CA e validade do próprio equipamento.'],
    ['RF02', 'O sistema deve permitir o cadastro de funcionários com nome, matrícula, setor e cargo.'],
    ['RF03', 'O sistema deve registrar a entrega de EPIs a funcionários, com data, quantidade e assinatura digital, dando baixa automática no estoque.'],
    ['RF04', 'O sistema deve registrar a devolução de EPIs, repondo o estoque automaticamente quando o item for reutilizável.'],
    ['RF05', 'O sistema deve manter o histórico de movimentações de estoque (entradas, saídas e baixas).'],
    ['RF06', 'O sistema deve informar quais EPIs cada funcionário possui no momento (entregue - devolvido).'],
    ['RF07', 'O sistema deve emitir alertas de estoque baixo/zerado e de validades próximas do vencimento.'],
    ['RF08', 'O sistema deve gerar relatórios de movimentação por período e exportá-los em PDF.'],
    ['RF09', 'O sistema deve controlar o acesso por login/senha e por perfil (administrador/usuário).'],
    ['RF10', 'O sistema deve permitir a inativação (exclusão lógica) de EPIs e funcionários, preservando o histórico.'],
  ].map((r) => r.map(sane)),
  styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 2, textColor: TEXT, lineColor: [203, 213, 225], lineWidth: 0.1 },
  headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
  columnStyles: { 0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' } },
});
y = doc.lastAutoTable.finalY + 4;
h3('5.2 Requisitos Não Funcionais');
autoTable(doc, {
  startY: y, margin: { left: M, right: M },
  head: [['Código', 'Descrição']],
  body: [
    ['RNF01', 'Segurança: proteger os dados com autenticação e políticas de acesso no banco (RLS), restringindo escrita a usuários autorizados.'],
    ['RNF02', 'Usabilidade: interface responsiva (desktop e mobile) e intuitiva, com navegação por menu lateral.'],
    ['RNF03', 'Desempenho: as consultas e telas devem carregar em poucos segundos sob uso normal.'],
    ['RNF04', 'Disponibilidade: o sistema deve ser acessível via web (nuvem), com backend gerenciado (Supabase).'],
    ['RNF05', 'Manutenibilidade: código modular (componentes/views) e banco versionado por migrações SQL.'],
    ['RNF06', 'Auditoria: ações sensíveis (baixa de estoque) registram o responsável e exigem reconfirmação de senha.'],
  ].map((r) => r.map(sane)),
  styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 2, textColor: TEXT, lineColor: [203, 213, 225], lineWidth: 0.1 },
  headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold' },
  columnStyles: { 0: { cellWidth: 20, fontStyle: 'bold', halign: 'center' } },
});
y = doc.lastAutoTable.finalY + 4;
h3('5.3 Ideação (Brainstorming de Funcionalidades)');
para('Login com perfis; cadastro de EPIs com validade CA/EPI; cadastro de funcionários e setores; controle de estoque (entrada/saída/baixa); baixa protegida por senha; entrega de múltiplos EPIs com assinatura digital; baixa automática de estoque na entrega; devolução com reposição (reutilizável/descarte); consulta de EPIs em posse por funcionário; alertas de validade e estoque mínimo; dashboard com KPIs e gráficos; rankings de funcionários/EPIs; relatórios com filtros e exportação em PDF; inativação lógica; controle de acesso admin/usuário; PDF comercial com números do sistema.');

// ===================== ETAPA 3 =====================
h2('Etapa 3 - Design e Prototipação');
h3('6.1 Prototipação de Telas');
para('Tela 1 - Login: fundo azul com gradiente, logo e nome "SafeEPI", subtítulo do sistema; card central com campos de e-mail e senha (com ícones), botão "Acessar Sistema" e mensagem de erro para credenciais inválidas. Layout responsivo.');
para('Tela 2 - Cadastro de EPIs: formulário com nome do EPI, nº do CA, validade do CA e opção "tem validade própria?" (mostra campo de data condicional). Abaixo, tabela dos EPIs cadastrados com nome, CA, validades, status (válido/vencido) e ações (editar, inativar). Busca por nome e opção de mostrar inativos.');
para('Tela 3 - Movimentação (Entrega/Devolução): na entrega, seleciona-se o funcionário e a data, marca-se vários EPIs numa lista (com saldo e status de validade), informa-se a quantidade e confirma-se a assinatura digital; o estoque baixa automaticamente. Na devolução, ao escolher o funcionário aparecem só os EPIs que ele tem em posse; escolhe-se o EPI, a quantidade e a condição (reutilizável -> volta ao estoque; descarte).');
para('Tela 4 - Consultas e Relatórios: filtros por período, funcionário, EPI e CA; tabela de resultados com validade, quantidade e assinatura; botões de imprimir e exportar PDF. O Dashboard complementa com KPIs (saldo, posse, vencidos), alertas, gráficos (pizza/barras/linha) e rankings.');
para('[Anexar aqui os protótipos visuais - prints reais das telas do sistema rodando.]', { color: GRAY });

h3('6.2 Diagrama de Casos de Uso (UML)');
image('diagrama-1-casos-de-uso.png', 'Atores Administrador e Usuário operacional e os casos de uso do SafeEPI.');
h3('6.3 Diagrama de Classes (UML)');
image('diagrama-2-classes.png', 'Classes do domínio e seus relacionamentos.');
h3('6.4 Diagrama de Sequência (UML) - Registrar Entrega');
image('diagrama-3-sequencia.png', 'Fluxo de registro de entrega com baixa automática de estoque.');
h3('6.5 Diagrama Entidade-Relacionamento (BD)');
image('diagrama-4-er.png', 'Modelo de dados (PostgreSQL/Supabase).');

// ===================== VALIDAÇÃO =====================
h2('7. Validação - Feedback do Usuário');
para('Pontos positivos identificados (sugeridos - validar com um colega):', { bold: true, gap: 1 });
bullets([
  'Interface limpa e responsiva.',
  'Baixa automática de estoque na entrega.',
  'Alertas de validade e estoque no dashboard.',
  'Rastreabilidade de quem está com cada EPI.',
  'Exportação de relatórios em PDF.',
]);
para('Pontos de melhoria identificados (sugeridos):', { bold: true, gap: 1 });
bullets([
  'Estoque mínimo configurável por EPI (hoje é um limite fixo).',
  'Cadastro de visitantes, além de funcionários.',
  'Notificações por e-mail de vencimento.',
  'Leitura por código de barras / QR Code.',
]);

// ===================== ESTRUTURA / LINKS =====================
h2('11. Estrutura de Pastas do Projeto (VS Code)');
tree(`EPIS_NEW/
├── docs/                       # Documentação gerada (PDF/Word/HTML) + diagramas
├── public/                     # Arquivos estáticos
├── migracoes.sql               # Migrações do banco (Supabase)
├── migracoes_02_inativacao.sql
├── migracoes_03_devolucao.sql
├── migracoes_04_perfis_rls.sql
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.vue
    ├── main.js
    ├── assets/                 # Imagens e CSS (logoEPI.jpg, main.css)
    ├── components/             # applayout.vue, menu.vue, footer.vue
    ├── composables/            # useSupabase.js (cliente + sessão + papel)
    ├── router/                 # index.js (rotas + proteção por perfil)
    ├── utils/                  # pdfComercial.js
    └── views/                  # login, home, dashboard, epi, funcionario,
                                #  setor, estoque, entrega, devolucao,
                                #  posse, relatorio`);
para('Stack: Vue 3 + Vite (front-end) · Supabase/PostgreSQL (back-end, autenticação e RLS) · Chart.js · jsPDF.', { gap: 3 });
doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(...TEXT);
ensure(14);
doc.text('Repositório (GitHub):', M, y);
doc.setFont('helvetica', 'normal').setTextColor(37, 99, 235);
doc.textWithLink(ALUNO.github, M + 42, y, { url: ALUNO.github });
y += 6;
doc.setFont('helvetica', 'bold').setTextColor(...TEXT);
doc.text('Aplicação (Deploy):', M, y);
doc.setFont('helvetica', 'normal').setTextColor(37, 99, 235);
doc.textWithLink(ALUNO.deploy, M + 42, y, { url: ALUNO.deploy });
y += 8;

// ===================== CONSIDERAÇÕES =====================
h2('18. Considerações Finais');
para('Esta atividade mostrou na prática como as etapas iniciais da Engenharia de Software - planejamento, análise e design - sustentam a implementação. Levantar os requisitos e prototipar antes de codificar evitou retrabalho e deixou claro o que o sistema precisava entregar. A maior dificuldade foi traduzir as regras de negócio (saldo de estoque, "EPIs em posse", devolução com reposição) em um modelo de dados coerente. Em um próximo projeto, eu investiria mais cedo nos diagramas UML e na validação com usuários antes de começar a programar.');
para('[Revise e reescreva com suas próprias palavras, se desejar.]', { color: GRAY });

// ===================== DECLARAÇÃO =====================
h2('19. Declaração de Autoria');
para('Declaro que desenvolvi esta atividade de forma individual ou (grupo / projeto integrador) e autônoma, conforme as orientações da disciplina de Engenharia de Software, respeitando os princípios éticos e acadêmicos.', { gap: 4 });
field('Nome completo:', ALUNO.nome);
field('Matrícula:', ALUNO.matricula);
field('Data: ____ / ____ / ______', '');
field('Assinatura:', '');

// ---- rodapé com paginação ----
const total = doc.getNumberOfPages();
for (let i = 1; i <= total; i++) {
  doc.setPage(i);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY);
  doc.text(sane('SafeEPI - Atividade Prática de Engenharia de Software'), M, PH - 8);
  doc.text(`Página ${i} de ${total}`, PW - M, PH - 8, { align: 'right' });
}

const out = join(DIR, 'Atividade-EngSoftware-SafeEPI.pdf');
writeFileSync(out, Buffer.from(doc.output('arraybuffer')));
console.log('OK ->', out, '|', total, 'páginas');
