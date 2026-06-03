// ============================================================
// Gerador do PDF da Atividade Pratica (SafeEPI) - VERSAO COMPLETA
// Segue a numeracao do template oficial (secoes 1-20), preenchido.
// Uso: node docs/gerar-atividade-completa.mjs
// ============================================================
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));

const ALUNO = {
  nome: 'Raphael Gouvêa Reche',
  matricula: '26164063',
  github: 'https://github.com/recheraphael-Re/EPIS_NEW',
  deploy: 'https://epis-new-bpyu.vercel.app/',
};

const NAVY = [30, 58, 95];
const BLUE = [31, 78, 121];
const ORANGE = [249, 115, 22];
const GRAY = [71, 85, 105];
const TEXT = [26, 26, 26];

const sane = (s) =>
  String(s)
    .replace(/—/g, '-').replace(/–/g, '-').replace(/−/g, '-')
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...')
    .replace(/├/g, '|').replace(/└/g, '`').replace(/│/g, '|').replace(/─/g, '-')
    .replace(/✓/g, 'x').replace(/→/g, '->').replace(/−/g, '-');

function pngInfo(path) {
  const buf = readFileSync(path);
  return { dataUrl: 'data:image/png;base64,' + buf.toString('base64'), w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
const PW = 210, PH = 297, M = 18, CW = PW - 2 * M;
let y = M;

function ensure(h) { if (y + h > PH - M) { doc.addPage(); y = M; } }

// Barra azul de secao principal (1., 2., ...)
function secao(txt) {
  ensure(14);
  y += 3;
  doc.setFillColor(...BLUE).rect(M, y, CW, 9, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(12.5).setTextColor(255, 255, 255);
  doc.text(sane(txt), M + 3, y + 6.2);
  y += 14;
}
function h3(txt) {
  ensure(10); y += 2;
  doc.setFont('helvetica', 'bold').setFontSize(11.5).setTextColor(...BLUE);
  doc.text(sane(txt), M, y); y += 5;
}
function rotulo(txt) {
  ensure(8); y += 1;
  doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(...TEXT);
  doc.text(sane(txt), M, y); y += 5;
}
function para(txt, opts = {}) {
  const size = opts.size || 10.5;
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal').setFontSize(size).setTextColor(...(opts.color || TEXT));
  doc.splitTextToSize(sane(txt), opts.w || CW).forEach((ln) => { ensure(size * 0.42 + 1.5); doc.text(ln, opts.x || M, y); y += size * 0.42 + 1.5; });
  y += opts.gap ?? 2;
}
function bullets(items) {
  doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(...TEXT);
  items.forEach((it) => {
    doc.splitTextToSize(sane(it), CW - 6).forEach((ln, i) => { ensure(5); if (i === 0) doc.text('•', M + 1, y); doc.text(ln, M + 6, y); y += 4.6; });
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
  let ty = y + 7; lines.forEach((ln) => { doc.text(ln, M + 6, ty); ty += 5.2; });
  y += boxH + 4;
}
function tree(txt) {
  const lines = sane(txt).split('\n');
  doc.setFont('courier', 'normal').setFontSize(8.2).setTextColor(51, 65, 85);
  const boxH = lines.length * 3.6 + 6;
  ensure(boxH + 2);
  doc.setFillColor(248, 250, 252).setDrawColor(226, 232, 240).setLineWidth(0.2).rect(M, y, CW, boxH, 'FD');
  let ty = y + 5; lines.forEach((ln) => { doc.text(ln, M + 4, ty); ty += 3.6; });
  y += boxH + 4;
}
function image(path, caption) {
  const { dataUrl, w, h } = pngInfo(join(DIR, path));
  let drawW = Math.min(CW, 165), drawH = (h / w) * drawW;
  const maxH = PH - 2 * M - 14;
  if (drawH > maxH) { drawH = maxH; drawW = (w / h) * drawH; }
  ensure(drawH + 8);
  const x = M + (CW - drawW) / 2;
  doc.setDrawColor(226, 232, 240).setLineWidth(0.2).rect(x, y, drawW, drawH);
  doc.addImage(dataUrl, 'PNG', x, y, drawW, drawH);
  y += drawH + 3;
  if (caption) { doc.setFont('helvetica', 'italic').setFontSize(8.5).setTextColor(...GRAY); doc.text(sane(caption), M, y); y += 5; }
}
function field(label, value) {
  ensure(8);
  doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(...TEXT);
  doc.text(sane(label), M, y);
  const lw = doc.getTextWidth(sane(label)) + 2;
  doc.setFont('helvetica', 'normal'); if (value) doc.text(sane(value), M + lw, y);
  doc.setDrawColor(148, 163, 184).setLineWidth(0.2).line(M + lw, y + 1, M + CW, y + 1);
  y += 8;
}
const tblStyle = {
  styles: { font: 'helvetica', fontSize: 9.5, cellPadding: 2, textColor: TEXT, lineColor: [203, 213, 225], lineWidth: 0.1 },
  headStyles: { fillColor: BLUE, textColor: [255, 255, 255], fontStyle: 'bold' },
};

// ===================== CAPA =====================
doc.setFillColor(...BLUE).rect(0, 0, PW, 4, 'F');
y = 40;
doc.setFont('helvetica', 'bold').setFontSize(22).setTextColor(...BLUE);
doc.text('SENAI SC - JOINVILLE SUL', PW / 2, y, { align: 'center' }); y += 9;
doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(...GRAY);
doc.text('Engenharia de Software', PW / 2, y, { align: 'center' }); y += 24;
doc.setFont('helvetica', 'bold').setFontSize(18).setTextColor(...BLUE);
doc.text('ATIVIDADE PRÁTICA', PW / 2, y, { align: 'center' }); y += 10;
doc.setFontSize(16);
doc.text(sane('Desenvolvimento de Sistema de Gestão de EPIs'), PW / 2, y, { align: 'center', maxWidth: CW }); y += 16;
doc.setFont('helvetica', 'normal').setFontSize(12).setTextColor(...TEXT);
doc.text(sane('Planejamento, Análise e Design de Software - Solução: SafeEPI'), PW / 2, y, { align: 'center' }); y += 24;
doc.setFontSize(10.5);
const capa = [
  ['Disciplina:', 'Engenharia de Software'],
  ['Professora:', 'Mestra Tatiana Aparecida de Almeida'],
  ['Período:', '2026'],
  ['Aluno:', ALUNO.nome],
  ['Matrícula:', ALUNO.matricula],
];
capa.forEach(([k, v]) => {
  doc.setFont('helvetica', 'bold').setTextColor(...BLUE);
  const kw = doc.getTextWidth(sane(k));
  const total = kw + 2 + doc.getTextWidth(sane(v));
  const sx = PW / 2 - total / 2;
  doc.text(sane(k), sx, y);
  doc.setFont('helvetica', 'normal').setTextColor(...TEXT);
  doc.text(sane(v), sx + kw + 2, y);
  y += 7;
});
doc.addPage(); y = M;

// ===================== 1. APRESENTAÇÃO =====================
secao('1. APRESENTAÇÃO DA ATIVIDADE');
para('Esta atividade aplica os conceitos de Engenharia de Software nas etapas iniciais do ciclo de vida (Planejamento, Análise e Design). A solução documentada é o SafeEPI, um sistema de gestão de Equipamentos de Proteção Individual que, além de documentado, foi implementado e publicado em nuvem.');
rotulo('Objetivos de aprendizagem:');
bullets([
  'Compreender e documentar problemas reais de gestão de processos.',
  'Aplicar técnicas de levantamento de requisitos funcionais e não funcionais.',
  'Desenvolver habilidades de análise e definição de necessidades de usuários.',
  'Criar protótipos de interface seguindo princípios de UX/UI.',
  'Validar soluções através de feedback estruturado.',
]);

// ===================== 2. CICLO DE VIDA =====================
secao('2. CICLO DE VIDA DO SOFTWARE');
autoTable(doc, {
  startY: y, margin: { left: M, right: M },
  head: [['Etapa do ciclo', 'Trabalhada?', 'Descrição']],
  body: [
    ['Planejamento', 'SIM', 'Entender o problema e definir objetivos'],
    ['Análise', 'SIM', 'Levantar e documentar requisitos'],
    ['Design', 'SIM', 'Criar protótipos e arquitetura visual'],
    ['Implementação', 'SIM*', 'Programação do sistema (* feita além do escopo mínimo)'],
    ['Testes Técnicos', 'PARCIAL', 'Validação manual e verificação de regras'],
    ['Implantação', 'SIM*', 'Publicado na Vercel (* além do escopo mínimo)'],
    ['Manutenção', 'NÃO', 'Correções e melhorias contínuas'],
  ].map((r) => r.map(sane)),
  ...tblStyle,
  columnStyles: { 0: { cellWidth: 42, fontStyle: 'bold' }, 1: { cellWidth: 26, halign: 'center' } },
});
y = doc.lastAutoTable.finalY + 3;
para('Observação: o foco da atividade são as três primeiras etapas; a implementação e a publicação foram realizadas como aprofundamento, validando na prática o que foi planejado.', { color: GRAY, size: 9.5 });

// ===================== 3. ESTUDO DE CASO =====================
secao('3. ESTUDO DE CASO: SISTEMA DE GESTÃO DE EPIs');
para('A SENAI SC Joinville Sul gerencia EPIs de forma totalmente manual, com planilhas de papel e registros desorganizados, o que compromete a segurança e a eficiência operacional. Os EPIs são essenciais para a segurança de funcionários e visitantes nas dependências e atividades práticas da instituição.');
frase('Missão: desenvolver a documentação e o design de um sistema informatizado que resolva os problemas identificados, automatizando o controle de EPIs e melhorando a gestão de segurança da instituição.');

// ===================== 4. ETAPA 1 - PLANEJAMENTO =====================
secao('4. ETAPA 1 - PLANEJAMENTO');
h3('4.1 Contextualização do Problema');
rotulo('Situação atual:');
para('No SENAI SC Joinville Sul, o controle de EPIs é feito de forma manual, com planilhas de papel e registros avulsos. Cada entrega a funcionários e visitantes é anotada à mão, sem um sistema central que relacione o equipamento, a pessoa, a data e o responsável. O estoque é conferido visualmente, sem atualização automática quando um EPI é entregue ou devolvido, e não há acompanhamento das validades (CA e do próprio equipamento).');
rotulo('Principais problemas identificados:');
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
  startY: y, margin: { left: M, right: M },
  head: [['Perfil', 'Papel no sistema']],
  body: [
    ['Administrador (almoxarife / gestor)', 'Cadastra EPIs, funcionários e setores; gerencia estoque; aprova solicitações; acessa tudo.'],
    ['Usuário operacional', 'Registra entregas e devoluções, solicita EPIs, consulta posse e gera relatórios.'],
    ['Funcionário / Visitante', 'Recebe os EPIs e confirma o recibo com assinatura digital (não acessa o sistema).'],
    ['Gestão / Coordenação', 'Consome dashboard e relatórios para decisão.'],
  ].map((r) => r.map(sane)),
  ...tblStyle,
  columnStyles: { 0: { cellWidth: 58, fontStyle: 'bold' } },
});
y = doc.lastAutoTable.finalY + 4;

// ===================== 5. ETAPA 2 - ANÁLISE =====================
secao('5. ETAPA 2 - ANÁLISE DE REQUISITOS');
h3('5.1 Requisitos Funcionais');
autoTable(doc, {
  startY: y, margin: { left: M, right: M },
  head: [['Código', 'Descrição do requisito funcional']],
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
    ['RF11', 'O sistema deve permitir que o usuário solicite EPIs para um funcionário (status pendente); o administrador aprova - gerando a entrega com baixa de estoque - ou rejeita.'],
  ].map((r) => r.map(sane)),
  ...tblStyle,
  columnStyles: { 0: { cellWidth: 18, fontStyle: 'bold', halign: 'center' } },
});
y = doc.lastAutoTable.finalY + 4;
h3('5.2 Requisitos Não Funcionais');
autoTable(doc, {
  startY: y, margin: { left: M, right: M },
  head: [['Código', 'Descrição do requisito não funcional']],
  body: [
    ['RNF01', 'Segurança: proteger os dados com autenticação e políticas de acesso no banco (RLS), restringindo a escrita a usuários autorizados.'],
    ['RNF02', 'Usabilidade: interface responsiva (desktop e mobile) e intuitiva, com navegação por menu lateral.'],
    ['RNF03', 'Desempenho: consultas e telas devem carregar em poucos segundos sob uso normal.'],
    ['RNF04', 'Disponibilidade: o sistema deve ser acessível via web (nuvem), com backend gerenciado (Supabase).'],
    ['RNF05', 'Manutenibilidade: código modular (componentes/views) e banco versionado por migrações SQL.'],
  ].map((r) => r.map(sane)),
  ...tblStyle,
  columnStyles: { 0: { cellWidth: 20, fontStyle: 'bold', halign: 'center' } },
});
y = doc.lastAutoTable.finalY + 4;
h3('5.3 Ideação - Funcionalidades do Sistema');
para('Login com perfis; cadastro de EPIs com validade CA/EPI; cadastro de funcionários e setores; controle de estoque (entrada/saída/baixa); baixa protegida por senha; entrega de múltiplos EPIs com assinatura digital; baixa automática de estoque na entrega; devolução com reposição (reutilizável/descarte); solicitação de EPIs com aprovação do administrador (a aprovação gera a entrega e baixa o estoque); consulta de EPIs em posse por funcionário; alertas de validade, estoque mínimo e solicitações pendentes; dashboard com KPIs e gráficos; rankings de funcionários/EPIs; relatórios com filtros e exportação em PDF; inativação lógica; controle de acesso admin/usuário; PDF comercial com números do sistema; diagramas DER/MER acessíveis no dashboard.');

// ===================== 6. ETAPA 3 - DESIGN =====================
secao('6. ETAPA 3 - DESIGN E PROTOTIPAÇÃO');
h3('6.1 Prototipação de Telas');
para('Tela 1 - Login: fundo azul com gradiente, logo e nome "SafeEPI", subtítulo; card central com e-mail e senha (com ícones), botão "Acessar Sistema" e mensagem de erro para credenciais inválidas. Layout responsivo.');
para('Tela 2 - Cadastro de EPIs: formulário com nome, nº do CA, validade do CA e a opção "tem validade própria?" (campo de data condicional). Abaixo, tabela dos EPIs com nome, CA, validades, status (válido/vencido) e ações (editar, inativar); busca e opção de mostrar inativos.');
para('Tela 3 - Movimentação (Entrega/Devolução): na entrega, escolhe-se o funcionário e a data, marcam-se vários EPIs (com saldo e validade), informa-se a quantidade e confirma-se a assinatura digital; o estoque baixa automaticamente. Na devolução, ao escolher o funcionário aparecem só os EPIs em posse; escolhe-se o EPI, a quantidade e a condição (reutilizável -> volta ao estoque; descarte).');
para('Tela 4 - Consultas e Relatórios: filtros por período, funcionário, EPI e CA; tabela com validade, quantidade e assinatura; imprimir e exportar PDF. O Dashboard complementa com KPIs (saldo, posse, vencidos), alertas, gráficos (pizza/barras/linha) e rankings.');
para('Tela 5 - Solicitação de EPIs (nova): o usuário escolhe funcionário, EPI e quantidade e registra uma solicitação (status pendente). O administrador vê a lista, confirma a assinatura digital e clica em "Aprovar" - gerando a entrega e baixando o estoque - ou em "Rejeitar". O Dashboard exibe alerta de solicitações pendentes.');
para('[Anexar os prints reais das telas do sistema rodando em ' + ALUNO.deploy + ']', { color: GRAY });

h3('6.2 Diagrama de Casos de Uso (UML)');
image('diagrama-1-casos-de-uso.png', 'Atores Administrador e Usuário operacional e os casos de uso do SafeEPI.');
h3('6.3 Diagrama de Classes (UML)');
image('diagrama-2-classes.png', 'Classes do domínio e seus relacionamentos.');
h3('6.4 Diagrama de Sequência (UML) - Registrar Entrega');
image('diagrama-3-sequencia.png', 'Fluxo de registro de entrega com baixa automática de estoque.');
h3('6.5 Diagrama Entidade-Relacionamento (BD)');
image('diagrama-5-der.png', 'Modelo de dados (PostgreSQL/Supabase), já com a entidade solicitacoes.');
h3('6.6 Modelo Entidade-Relacionamento Conceitual (MER)');
image('diagrama-6-mer.png', 'Modelo conceitual (Chen) com as relações recebe, devolve, solicita, pertence e movimenta.');

// ===================== 7. VALIDAÇÃO =====================
secao('7. VALIDAÇÃO - FEEDBACK DO USUÁRIO');
rotulo('Pontos positivos identificados:');
bullets([
  'Interface limpa e responsiva.',
  'Baixa automática de estoque na entrega.',
  'Alertas de validade, estoque e solicitações pendentes no dashboard.',
  'Rastreabilidade de quem está com cada EPI.',
  'Exportação de relatórios em PDF.',
  'Fluxo de solicitação com aprovação do administrador (pedido -> aprovação -> entrega).',
]);
rotulo('Pontos de melhoria identificados:');
bullets([
  'Estoque mínimo configurável por EPI (hoje é um limite fixo).',
  'Cadastro de visitantes, além de funcionários.',
  'Notificações por e-mail (vencimento e novas solicitações).',
  'Leitura por código de barras / QR Code.',
]);

// ===================== 8-11. IMPLEMENTAÇÃO E ESTRUTURA =====================
secao('8-11. IMPLEMENTAÇÃO E ESTRUTURA DO PROJETO');
para('Após a validação, o projeto avançou para a implementação real, com arquitetura modular e navegação intuitiva, refletindo as melhorias identificadas no protótipo. A organização das pastas (VS Code) facilita a manutenção e o entendimento do fluxo de dados.');
tree(`EPIS_NEW/
├── docs/                       # Documentação + diagramas (DER/MER, schema-safeepi.sql)
├── public/                     # Arquivos estáticos
├── migracoes.sql               # Migrações do banco (Supabase)
├── migracoes_02_inativacao.sql
├── migracoes_03_devolucao.sql
├── migracoes_04_perfis_rls.sql
├── migracoes_05_solicitacoes.sql
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
    ├── utils/                  # pdfComercial.js, diagramaImg.js
    └── views/                  # login, home, dashboard, epi, funcionario,
                                #  setor, estoque, entrega, solicitacao,
                                #  devolucao, posse, relatorio`);
para('Stack: Vue 3 + Vite (front-end) · Supabase/PostgreSQL (back-end, autenticação e RLS) · Chart.js · jsPDF.', { gap: 3 });
doc.setFont('helvetica', 'bold').setFontSize(10.5).setTextColor(...TEXT); ensure(14);
doc.text('Repositório (GitHub):', M, y);
doc.setFont('helvetica', 'normal').setTextColor(37, 99, 235);
doc.textWithLink(ALUNO.github, M + 42, y, { url: ALUNO.github }); y += 6;
doc.setFont('helvetica', 'bold').setTextColor(...TEXT);
doc.text('Aplicação (Deploy):', M, y);
doc.setFont('helvetica', 'normal').setTextColor(37, 99, 235);
doc.textWithLink(ALUNO.deploy, M + 42, y, { url: ALUNO.deploy }); y += 8;

// ===================== 18. CONSIDERAÇÕES =====================
secao('18. CONSIDERAÇÕES FINAIS');
para('Esta atividade mostrou na prática como as etapas iniciais da Engenharia de Software - planejamento, análise e design - sustentam a implementação. Levantar os requisitos e prototipar antes de codificar evitou retrabalho e deixou claro o que o sistema precisava entregar. A maior dificuldade foi traduzir as regras de negócio (saldo de estoque, "EPIs em posse", devolução com reposição e o fluxo de solicitação com aprovação) em um modelo de dados coerente. Acrescentar a solicitação depois da primeira versão reforçou a importância de um bom modelo: bastou criar a tabela solicitacoes e reaproveitar a lógica de entrega já existente. Em um próximo projeto, eu investiria ainda mais cedo nos diagramas UML e na validação com usuários antes de programar.');

// ===================== 19. DECLARAÇÃO =====================
secao('19. DECLARAÇÃO DE AUTORIA');
para('Declaro que desenvolvi esta atividade de forma individual e autônoma, conforme as orientações da disciplina de Engenharia de Software, respeitando os princípios éticos e acadêmicos.', { gap: 4 });
field('Nome completo:', ALUNO.nome);
field('Matrícula:', ALUNO.matricula);
field('Data: ____ / ____ / ______', '');
field('Assinatura:', '');

// ===================== 20. CHECKLIST =====================
secao('20. CHECKLIST DE ENTREGA');
bullets([
  '[x] Descrição da situação atual e problemas identificados',
  '[x] Definição clara do problema em uma frase',
  '[x] Identificação de todos os perfis de usuários',
  '[x] No mínimo 5 requisitos funcionais (11 descritos)',
  '[x] No mínimo 3 requisitos não funcionais (5 descritos)',
  '[x] Lista de funcionalidades (brainstorming)',
  '[x] Descrição das 4+ telas principais (5 descritas)',
  '[ ] Protótipos visuais anexados (prints reais das telas)',
  '[x] Diagrama de Casos de Uso (UML)',
  '[x] Diagrama de Classes (UML)',
  '[x] Diagrama de Sequência (UML)',
  '[x] Diagrama de Entidade-Relacionamento (com solicitacoes)',
  '[x] Estrutura de Pastas do Projeto (VS Code)',
  '[x] Código e Deploy (links informados)',
  '[x] Feedback com pontos positivos e de melhoria',
  '[x] Considerações finais reflexivas',
  '[ ] Declaração de autoria assinada (falta data e assinatura)',
  '[x] Documento completo, organizado e revisado',
]);

// ---- rodapé ----
const total = doc.getNumberOfPages();
for (let i = 1; i <= total; i++) {
  doc.setPage(i);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY);
  doc.text(sane('SafeEPI - Atividade Prática de Engenharia de Software'), M, PH - 8);
  doc.text(`Página ${i} de ${total}`, PW - M, PH - 8, { align: 'right' });
}

const out = join(DIR, 'Atividade-EngSoftware-SafeEPI-Completa.pdf');
writeFileSync(out, Buffer.from(doc.output('arraybuffer')));
console.log('OK ->', out, '|', total, 'páginas');
