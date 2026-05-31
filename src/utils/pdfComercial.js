import jsPDF from 'jspdf'
import logoSafeEPI from '../assets/logoEPI.jpg'
import { useSupabase } from '../composables/useSupabase'

// Paleta da marca
const NAVY = [30, 58, 95]
const ORANGE = [249, 115, 22]
const GRAY = [71, 85, 105]
const LIGHT = [148, 163, 184]

// Coleta números reais do sistema para a seção "em números".
// Em caso de falha (ex.: offline), mantém zeros e o PDF é gerado mesmo assim.
async function coletarNumeros() {
  const nums = { epis: 0, funcionarios: 0, saldo: 0, posse: 0, entregas: 0, devolucoes: 0 }
  try {
    const { supabase } = useSupabase()
    const [epis, funcs, entCount, devCount, mov, entQty, devQty] = await Promise.all([
      supabase.from('epi').select('*', { count: 'exact', head: true }).eq('ativo', true),
      supabase.from('funcionarios').select('*', { count: 'exact', head: true }).eq('ativo', true),
      supabase.from('entregas').select('*', { count: 'exact', head: true }),
      supabase.from('devolucoes').select('*', { count: 'exact', head: true }),
      supabase.from('estoque').select('tipo, quantidade'),
      supabase.from('entregas').select('quantidade_entregue'),
      supabase.from('devolucoes').select('quantidade')
    ])
    nums.epis = epis.count || 0
    nums.funcionarios = funcs.count || 0
    nums.entregas = entCount.count || 0
    nums.devolucoes = devCount.count || 0
    nums.saldo = (mov.data || []).reduce((s, m) => s + (m.tipo === 'entrada' ? m.quantidade : -m.quantidade), 0)
    const totalEntregue = (entQty.data || []).reduce((s, e) => s + (e.quantidade_entregue || 1), 0)
    const totalDevolvido = (devQty.data || []).reduce((s, d) => s + d.quantidade, 0)
    nums.posse = totalEntregue - totalDevolvido
  } catch (_) { /* mantém zeros se a consulta falhar */ }
  return nums
}

/**
 * Gera e baixa a apresentação comercial do SafeEPI em PDF,
 * descrevendo as funcionalidades atuais do sistema (inclui as melhorias recentes).
 */
export async function gerarPdfComercial() {
  const doc = new jsPDF()
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentW = pageW - margin * 2
  let y = 0

  // ── Carrega o logo (opcional) ──
  let logoData = null
  try {
    logoData = await fetch(logoSafeEPI)
      .then(r => r.blob())
      .then(b => new Promise(res => {
        const fr = new FileReader()
        fr.onload = () => res(fr.result)
        fr.readAsDataURL(b)
      }))
  } catch (_) { /* logo opcional */ }

  // ── Números reais do sistema ──
  const nums = await coletarNumeros()

  // ── Helpers ──
  function novaPaginaSePreciso(altura) {
    if (y + altura > pageH - 22) {
      rodape()
      doc.addPage()
      y = margin
    }
  }

  function tituloSecao(texto) {
    novaPaginaSePreciso(16)
    y += 4
    doc.setFillColor(...ORANGE)
    doc.rect(margin, y - 3.5, 3, 5, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(...NAVY)
    doc.text(texto, margin + 6, y + 1)
    y += 8
  }

  function paragrafo(texto, size = 10) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...GRAY)
    const linhas = doc.splitTextToSize(texto, contentW)
    for (const linha of linhas) {
      novaPaginaSePreciso(6)
      doc.text(linha, margin, y)
      y += 5.5
    }
    y += 2
  }

  function item(titulo, descricao, destaque = false) {
    novaPaginaSePreciso(13)
    // marcador
    doc.setFillColor(...(destaque ? ORANGE : NAVY))
    doc.circle(margin + 1.5, y - 1.3, 1.3, 'F')
    // título do item
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...NAVY)
    const tituloTxt = destaque ? `${titulo}  (novo)` : titulo
    doc.text(tituloTxt, margin + 6, y)
    y += 5
    // descrição
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...GRAY)
    const linhas = doc.splitTextToSize(descricao, contentW - 6)
    for (const linha of linhas) {
      novaPaginaSePreciso(5.5)
      doc.text(linha, margin + 6, y)
      y += 5
    }
    y += 3
  }

  function secaoNumeros() {
    tituloSecao('O SafeEPI em números')
    const cards = [
      { v: nums.epis,         l: 'EPIs cadastrados' },
      { v: nums.funcionarios, l: 'Funcionários' },
      { v: nums.saldo,        l: 'Saldo em estoque (un.)' },
      { v: nums.posse,        l: 'EPIs em posse (un.)' },
      { v: nums.entregas,     l: 'Entregas registradas' },
      { v: nums.devolucoes,   l: 'Devoluções registradas' }
    ]
    const cols = 3
    const gap = 5
    const boxW = (contentW - gap * (cols - 1)) / cols
    const boxH = 24
    for (let i = 0; i < cards.length; i += cols) {
      novaPaginaSePreciso(boxH + gap)
      const linha = cards.slice(i, i + cols)
      linha.forEach((c, j) => {
        const x = margin + j * (boxW + gap)
        doc.setFillColor(245, 247, 250)
        doc.roundedRect(x, y, boxW, boxH, 2, 2, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(18)
        doc.setTextColor(...ORANGE)
        doc.text(String(c.v), x + boxW / 2, y + 11, { align: 'center' })
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(...GRAY)
        doc.text(c.l, x + boxW / 2, y + 18, { align: 'center' })
      })
      y += boxH + gap
    }
    y += 2
  }

  function rodape() {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...LIGHT)
    doc.text('SafeEPI — Sistema de Gestão de EPIs', margin, pageH - 10)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageW - margin, pageH - 10, { align: 'right' })
  }

  // ── Cabeçalho / capa ──
  doc.setFillColor(...NAVY)
  doc.rect(0, 0, pageW, 46, 'F')
  if (logoData) {
    try { doc.addImage(logoData, 'JPEG', margin, 11, 24, 24) } catch (_) { /* ignore */ }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(255, 255, 255)
  doc.text('SafeEPI', margin + 30, 23)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(203, 213, 225)
  doc.text('Gestão de Equipamentos de Proteção Individual', margin + 30, 32)

  y = 58

  // ── Introdução ──
  paragrafo(
    'O SafeEPI é uma plataforma completa para o controle de Equipamentos de Proteção Individual. ' +
    'Centraliza o cadastro, o estoque, as entregas e as devoluções, oferecendo rastreabilidade total e ' +
    'apoio direto à conformidade com as normas de segurança do trabalho.',
    11
  )

  // ── Números reais do sistema ──
  secaoNumeros()

  // ── Funcionalidades ──
  tituloSecao('Principais Funcionalidades')
  item('Cadastro de EPIs com controle de validade',
    'Registro de equipamentos com número do CA e controle de vencimento do CA e da validade do próprio EPI.')
  item('Cadastro de funcionários e setores',
    'Gestão de colaboradores por matrícula, cargo e setor, com busca rápida.')
  item('Controle de estoque',
    'Entradas, saídas e baixas (perda, dano, descarte) com motivo, data e usuário responsável.')
  item('Entregas com assinatura digital',
    'Registro de entrega de múltiplos EPIs por funcionário, com confirmação de assinatura e baixa automática no estoque.')
  item('Devolução com reposição automática de estoque',
    'Registro da devolução por funcionário; itens reutilizáveis voltam ao estoque automaticamente, itens danificados são descartados.', true)
  item('EPIs em posse de cada funcionário',
    'Consulta, a qualquer momento, de quais EPIs e quantidades cada colaborador possui (entregue menos devolvido), com exportação em PDF.', true)
  item('Alertas automáticos',
    'Avisos de CA e EPIs vencendo, de estoque baixo ou zerado e de funcionários sem entrega recente.')
  item('Dashboard com indicadores',
    'Visão executiva com KPIs de estoque e posse, gráficos de inventário e de entregas, rankings e alertas acionáveis.', true)
  item('Relatórios e exportação',
    'Relatórios de movimentação por período e por funcionário, com impressão e exportação em PDF.')
  item('Controle de acesso por perfil',
    'Perfis de administrador e usuário: telas de cadastro e estoque restritas ao administrador, com bloqueio reforçado no banco de dados.', true)
  item('Inativação preservando o histórico',
    'Exclusão lógica de EPIs e funcionários: o registro sai das listas, mas todo o histórico de movimentações é mantido.', true)

  // ── Benefícios ──
  tituloSecao('Benefícios')
  paragrafo('• Rastreabilidade completa de quem recebeu cada EPI, quando e em que condição.')
  paragrafo('• Redução de perdas e compras desnecessárias com o controle de estoque em tempo real.')
  paragrafo('• Apoio à conformidade legal, com histórico auditável e controle de validade dos equipamentos.')
  paragrafo('• Decisões mais rápidas a partir de alertas e indicadores no dashboard.')
  paragrafo('• Segurança da informação com acesso por perfil e dados protegidos por políticas no banco.')

  rodape()
  doc.save('safeepi-apresentacao-comercial.pdf')
}
