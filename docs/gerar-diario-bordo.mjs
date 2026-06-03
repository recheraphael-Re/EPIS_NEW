// ============================================================
// Gerador do Diário de Bordo - Projeto Integrador "EPIra"
// Uso: node docs/gerar-diario-bordo.mjs
// ============================================================
import { jsPDF } from 'jspdf';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const DIR = dirname(fileURLToPath(import.meta.url));

const NAVY = [30, 58, 95];
const BLUE = [31, 78, 121];
const RED = [206, 32, 39];
const GRAY = [90, 100, 115];
const TEXT = [26, 26, 26];

const sane = (s) =>
  String(s)
    .replace(/—/g, '-').replace(/–/g, '-').replace(/−/g, '-')
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...');

const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
const PW = 210, PH = 297, M = 18, CW = PW - 2 * M;
let y = M;

function ensure(h) { if (y + h > PH - M) { doc.addPage(); y = M; } }
function titulo(txt) {
  ensure(12);
  doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(...TEXT);
  doc.text(sane(txt), M, y); y += 7;
}
function semanaBar(txt) {
  ensure(12); y += 2;
  doc.setFillColor(...BLUE).rect(M, y, CW, 8, 'F');
  doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(255, 255, 255);
  doc.text(sane(txt), M + 3, y + 5.6); y += 12;
}
function rotuloValor(rotulo, valor) {
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...NAVY);
  ensure(5.5); doc.text(sane(rotulo), M, y);
  const rw = doc.getTextWidth(sane(rotulo)) + 2;
  doc.setFont('helvetica', 'normal').setTextColor(...TEXT);
  const lines = doc.splitTextToSize(sane(valor), CW - rw);
  doc.text(lines[0] || '', M + rw, y); y += 5;
  for (let i = 1; i < lines.length; i++) { ensure(5); doc.text(lines[i], M, y); y += 5; }
  y += 1.5;
}
function campo(rotulo, valor) {
  doc.setFont('helvetica', 'bold').setFontSize(9.8).setTextColor(...NAVY);
  ensure(5); doc.text(sane(rotulo), M, y); y += 4.6;
  doc.setFont('helvetica', 'normal').setFontSize(9.8).setTextColor(...TEXT);
  doc.splitTextToSize(sane(valor), CW).forEach((ln) => { ensure(4.6); doc.text(ln, M, y); y += 4.6; });
  y += 2.5;
}
function para(txt, opts = {}) {
  const size = opts.size || 10;
  doc.setFont('helvetica', opts.bold ? 'bold' : 'normal').setFontSize(size).setTextColor(...(opts.color || TEXT));
  doc.splitTextToSize(sane(txt), CW).forEach((ln) => { ensure(size * 0.42 + 1.4); doc.text(ln, M, y); y += size * 0.42 + 1.4; });
  y += opts.gap ?? 2;
}

function semana(num, data, at, dif, sol, apr, prox) {
  semanaBar(`Semana ${num}   -   Data: ${data}`);
  campo('Atividades Realizadas:', at);
  campo('Dificuldades Encontradas:', dif);
  campo('Soluções Aplicadas:', sol);
  campo('Aprendizados:', apr);
  campo('Próximos Passos:', prox);
}

// ===================== CABEÇALHO =====================
doc.setFillColor(...RED).rect(M, y, 34, 11, 'F');
doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(255, 255, 255);
doc.text('SENAI', M + 3, y + 7.8);
y += 18;
titulo('Diário de Bordo - Projeto Integrador');
doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(...TEXT);
[['Turma:', 'CSTADS126N1 A e B'], ['Data de Início:', '02 / 02 / 2026'], ['Projeto:', 'EPIra - Gestão de EPI'], ['Entrega do projeto final:', '11 / 06 / 2026 (quinta-feira)']]
  .forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold').setTextColor(...NAVY); ensure(5.5); doc.text(sane(k), M, y);
    const kw = doc.getTextWidth(sane(k)) + 2;
    doc.setFont('helvetica', 'normal').setTextColor(...TEXT); doc.text(sane(v), M + kw, y); y += 5.6;
  });
y += 2;

// ===================== INFORMAÇÕES =====================
titulo('Informações do Projeto');
para('O projeto tem como objetivo digitalizar e automatizar o gerenciamento de EPIs do SENAI Joinville, substituindo o controle manual em papel, processo atual que gera registros inconsistentes, perdas de equipamento e sobrecarga na equipe responsável. O sistema permite o cadastro de EPIs, o registro de retiradas (entregas) e devoluções vinculadas a cada usuário, o acompanhamento em tempo real do estoque disponível e a solicitação de EPIs com aprovação do administrador, reduzindo erros operacionais e centralizando as informações em uma única plataforma.');

// ===================== LINKS =====================
titulo('Links');
rotuloValor('Repositório (GitHub): ', 'https://github.com/recheraphael-Re/EPIS_NEW');
rotuloValor('Aplicação (Deploy): ', 'https://epis-new-bpyu.vercel.app/');
rotuloValor('Protótipo (Figma): ', 'https://www.figma.com/proto/MpSjYPbGgAS0PGyQicCM0r/');
rotuloValor('Figma (Design): ', 'https://www.figma.com/design/MpSjYPbGgAS0PGyQicCM0r/');
rotuloValor('Google Drive: ', 'https://drive.google.com/drive/folders/1NLztJJjruRrJGezFysJjz9VIko8K5kIh');
y += 2;

// ===================== EQUIPE =====================
titulo('Autor');
[
  ['Raphael Gouvêa Reche', 'Desenvolvedor full-stack (projeto individual)'],
].forEach(([nome, func]) => {
  ensure(5.5);
  doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...TEXT);
  doc.text(sane('Nome: ' + nome), M, y);
  doc.setFont('helvetica', 'normal').setTextColor(...NAVY);
  doc.text(sane('Função: ' + func), M + 75, y); y += 5.8;
});
y += 2;

// ===================== SEMANAS =====================
semana('1', '26 / 03 / 2026',
  'Avancei no desenvolvimento do protótipo das páginas do software, mantendo o estilo de design e a paleta de cores.',
  'Manter um padrão visual consistente entre as diferentes páginas do software.',
  'Definir uma identidade visual única (paleta e componentes) e replicá-la em todas as páginas, revisando-as com frequência para manter a constância.',
  'Aprimorei a organização do trabalho e o planejamento visual do projeto.',
  'Fazer os diagramas e começar a passar os protótipos para código. Desenvolver as telas do projeto.');

semana('2', '02 / 04 / 2026',
  'Início do desenvolvimento dos diagramas e implementação da estrutura do Vue no GitHub.',
  'Alinhamento de todas as informações para que o banco de dados fosse implementado exatamente como planejado e atendesse às expectativas da solução.',
  'Atentar sempre ao levantamento de requisitos e aos diagramas; quando preciso, readequar o projeto como um todo.',
  'Maior compreensão sobre o processo de desenvolvimento e a integração entre as etapas.',
  'Desenvolver o código das telas do projeto no Vue.');

semana('3', '24 / 04 / 2026',
  'Início da criação (HTML e CSS) das páginas e organização do versionamento no GitHub, com commits e pushes a cada parte concluída.',
  'Organizar o fluxo de trabalho no GitHub (pull e push) mantendo o repositório consistente.',
  'Disciplina no versionamento, commits descritivos e organização das alterações.',
  'Aprendi a usar o Git/GitHub de forma organizada, evitando conflitos no repositório.',
  'Finalizar o desenvolvimento do código no VS Code e personalizar as páginas conforme o protótipo (CSS).');

semana('4', '30 / 04 / 2026',
  'Desenvolvimento do código iniciado: instalação da estrutura do Vue e do Vue Router, direcionamento e estruturação das páginas, sidebar e organização das branches no GitHub.',
  'Personalização das telas com a mesma identidade visual e integração do código na branch main sem conflitos.',
  'Primeiro a inclusão de todas as informações e, por último, a personalização das páginas - realizada uma única vez e reproduzida nas demais -, alinhando layout e identidade visual.',
  'Novos conhecimentos das funcionalidades do GitHub e do VS Code; ganho de habilidade nas ferramentas e na condução do projeto.',
  'Aprimorar as funcionalidades das páginas, alinhar o código com o protótipo e fazer a conexão com o banco de dados.');

semana('5', '_____ / _____ / _____',
  'Conexão do front-end (Vue) com o banco de dados no Supabase por meio de um composable (useSupabase); implementação do CRUD de EPIs, funcionários e setores; integração das telas com dados reais e carregamento dinâmico das listas.',
  'Modelar as tabelas (epi, funcionarios, setores, estoque, entregas, devolucoes) e fazer as telas refletirem os dados em tempo real, além de lidar com o ciclo de autenticação (sessão) sem travar a aplicação.',
  'Seguir o DER definido; centralizar o cliente Supabase em um composable reutilizável; tratar a sessão fora do callback de autenticação para evitar o travamento do app.',
  'Integração Vue + Supabase, uso de variáveis de ambiente e consultas com filtros e contagens.',
  'Implementar as movimentações (entrega/devolução), o controle de estoque e os indicadores do dashboard.');

semana('6', '_____ / _____ / _____',
  'Implementação das movimentações: entrega com assinatura digital e baixa automática de estoque, devolução com reposição (reutilizável/descarte), histórico de estoque e consulta de "EPIs em posse"; dashboard com KPIs, gráficos e alertas; controle de acesso por perfil (admin/usuário) com políticas RLS no banco; função de solicitação de EPIs com aprovação do administrador; e publicação do deploy na Vercel.',
  'Garantir a consistência do estoque nas operações automáticas e proteger as escritas no banco por perfil, sem bloquear ações legítimas dos usuários.',
  'Lógica de baixa e estorno de estoque vinculada às movimentações; função is_admin() (SECURITY DEFINER) e políticas RLS por tabela; reaproveitamento da lógica de entrega ao aprovar uma solicitação.',
  'Row Level Security (RLS), regras de negócio aplicadas no banco, geração de PDF (relatórios) e deploy contínuo na Vercel.',
  'Revisar a documentação e os diagramas (incluindo a entidade solicitacoes no DER/MER), anexar os prints das telas e preparar a entrega final (11/06/2026).');

// ===================== REFLEXÃO FINAL =====================
semanaBar('Reflexão Final');
campo('Qual foi o maior desafio do projeto?',
  'Traduzir as regras de negócio (saldo de estoque, "EPIs em posse", devolução com reposição e o fluxo de solicitação/aprovação) em um modelo de dados coerente e proteger as escritas no banco por perfil, sem bloquear ações legítimas dos usuários.');
campo('Como você superou esse desafio?',
  'Planejando com diagramas (casos de uso, classes, sequência, DER e MER) antes de codificar, versionando o banco por migrações e protegendo os dados com Row Level Security no Supabase. Sempre que uma regra de negócio mudava, ajustava o projeto como um todo para manter a coerência.');
campo('Quais foram os principais aprendizados?',
  'Desenvolvimento com Vue 3 + Vite, integração com Supabase/PostgreSQL e Row Level Security, modelagem de dados (DER/MER), geração de relatórios em PDF e deploy contínuo na nuvem (Vercel).');

// ---- rodapé ----
const total = doc.getNumberOfPages();
for (let i = 1; i <= total; i++) {
  doc.setPage(i);
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...GRAY);
  doc.text(sane('Diário de Bordo - Projeto Integrador EPIra'), M, PH - 8);
  doc.text(`Página ${i} de ${total}`, PW - M, PH - 8, { align: 'right' });
}

const out = join(DIR, 'Diario-de-Bordo-EPIra.pdf');
writeFileSync(out, Buffer.from(doc.output('arraybuffer')));
console.log('OK ->', out, '|', total, 'páginas');
