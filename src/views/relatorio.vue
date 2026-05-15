<template>
  <div class="page">
    <!-- Cabeçalho exclusivo para impressão -->
    <div class="print-header">
      <img src="../assets/logoEPI.jpg" alt="SafeEPI" class="print-logo" />
      <div>
        <h1 class="print-title">SafeEPI</h1>
        <p class="print-sub">Relatório de Entregas de EPIs</p>
      </div>
    </div>

    <header class="page-header">
      <div>
        <h1>Relatórios</h1>
        <p>Consulte e filtre o histórico de entregas de EPIs</p>
      </div>
      <div style="display:flex;gap:.6rem">
        <button class="btn-outline" @click="imprimir">
          <i class="fas fa-print"></i> Imprimir
        </button>
        <button class="btn-primary" @click="exportarPDF" :disabled="entregasFiltradas.length === 0">
          <i class="fas fa-file-pdf"></i> Exportar PDF
        </button>
      </div>
    </header>

    <!-- FILTROS -->
    <div class="card no-print">
      <div class="card-header">
        <h2><i class="fas fa-filter"></i> Filtros</h2>
        <button class="btn-sm btn-edit" @click="limparFiltros">
          <i class="fas fa-times"></i> Limpar
        </button>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field">
            <label>Período</label>
            <select v-model="filtro.periodo" @change="aplicarPeriodo">
              <option value="qualquer">Qualquer data</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </div>
          <div class="field" v-if="filtro.periodo === 'personalizado'">
            <label>Data Inicial</label>
            <input v-model="filtro.dataInicio" type="date" />
          </div>
          <div class="field" v-if="filtro.periodo === 'personalizado'">
            <label>Data Final</label>
            <input v-model="filtro.dataFim" type="date" />
          </div>
          <div class="field">
            <label>Funcionário</label>
            <select v-model="filtro.funcionario">
              <option value="">Todos os funcionários</option>
              <option v-for="f in funcionarios" :key="f.id" :value="f.nome">{{ f.nome }}</option>
            </select>
          </div>
          <div class="field">
            <label>EPI</label>
            <select v-model="filtro.epi">
              <option value="">Todos os EPIs</option>
              <option v-for="e in epis" :key="e.id" :value="e.nome">{{ e.nome }}</option>
            </select>
          </div>
          <div class="field">
            <label>CA (Certificado)</label>
            <select v-model="filtro.ca">
              <option value="">Todos os CAs</option>
              <option v-for="e in epis.filter(x => x.ca)" :key="e.id" :value="e.ca">{{ e.ca }} — {{ e.nome }}</option>
            </select>
          </div>
        </div>
        <button class="btn-primary" @click="filtrar">
          <i class="fas fa-search"></i> Aplicar Filtros
        </button>
      </div>
    </div>

    <!-- RESULTADO -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-list-alt"></i> Resultados</h2>
        <div class="resumo-badge">
          <i class="fas fa-chart-bar"></i>
          {{ entregasFiltradas.length }} entrega{{ entregasFiltradas.length !== 1 ? 's' : '' }} encontrada{{ entregasFiltradas.length !== 1 ? 's' : '' }}
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Funcionário</th>
              <th>EPI Entregue</th>
              <th>CA</th>
              <th>Vencimento CA</th>
              <th>Validade do EPI</th>
              <th class="text-center">Qtd</th>
              <th class="text-center">Assinatura</th>
              <th>Data de Entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in entregasFiltradas" :key="e.id">
              <td class="row-num">{{ i + 1 }}</td>
              <td>
                <div class="nome-cell">
                  <span class="avatar">{{ e.funcionario?.charAt(0) }}</span>
                  {{ e.funcionario }}
                </div>
              </td>
              <td><span class="badge badge-setor">{{ e.epi }}</span></td>
              <td><code class="ca-code">{{ e.ca || '—' }}</code></td>
              <td>
                <span :class="['badge', isVencido(e.validade) ? 'badge-vencido' : 'badge-ok']">
                  {{ formatarData(e.validade) }}
                </span>
              </td>
              <td>
                <span v-if="!e.validade_epi" class="badge-na">N/A</span>
                <span v-else :class="['badge', isVencido(e.validade_epi) ? 'badge-vencido' : 'badge-ok']">
                  {{ formatarData(e.validade_epi) }}
                </span>
              </td>
              <td class="text-center"><strong>{{ e.quantidade_entregue || 1 }}</strong></td>
              <td class="text-center">
                <span :class="e.assinatura_digital ? 'badge badge-ok' : 'badge badge-warn'">
                  <i :class="e.assinatura_digital ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                  {{ e.assinatura_digital ? 'Assinado' : 'Pendente' }}
                </span>
              </td>
              <td>{{ formatarData(e.data) }}</td>
            </tr>
            <tr v-if="entregasFiltradas.length === 0">
              <td colspan="9" class="empty">
                <i class="fas fa-search" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                Nenhum registro encontrado para os filtros aplicados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoSafeEPI from '../assets/logoEPI.jpg'

const { supabase } = useSupabase()

const todasEntregas = ref([])
const entregasFiltradas = ref([])
const funcionarios = ref([])
const epis = ref([])
const loading = ref(true)

const filtro = ref({ periodo: 'qualquer', dataInicio: '', dataFim: '', funcionario: '', epi: '', ca: '' })

function aplicarPeriodo() {
  if (filtro.value.periodo === 'qualquer') {
    filtro.value.dataInicio = ''
    filtro.value.dataFim = ''
  }
}

const carregar = async () => {
  loading.value = true
  const [{ data, error }, { data: funcs }, { data: episData }] = await Promise.all([
    supabase
      .from('entregas')
      .select('id, data, quantidade_entregue, assinatura_digital, funcionarios(nome), epi(nome, ca, validade, validade_epi)')
      .order('data', { ascending: false }),
    supabase.from('funcionarios').select('id, nome').order('nome'),
    supabase.from('epi').select('id, nome, ca, validade').order('nome')
  ])
  if (!error) {
    todasEntregas.value = (data || []).map(e => ({
      ...e,
      funcionario: e.funcionarios?.nome ?? '—',
      epi: e.epi?.nome ?? '—',
      ca: e.epi?.ca ?? '',
      validade: e.epi?.validade ?? null,
      validade_epi: e.epi?.validade_epi ?? null
    }))
    entregasFiltradas.value = todasEntregas.value
  }
  funcionarios.value = funcs || []
  epis.value = episData || []
  loading.value = false
}

function filtrar() {
  entregasFiltradas.value = todasEntregas.value.filter(e => {
    const data = new Date(e.data + 'T00:00:00')
    const ini = filtro.value.dataInicio ? new Date(filtro.value.dataInicio) : null
    const fim = filtro.value.dataFim ? new Date(filtro.value.dataFim) : null
    const matchData = (!ini || data >= ini) && (!fim || data <= fim)
    const matchFunc = e.funcionario?.toLowerCase().includes(filtro.value.funcionario.toLowerCase())
    const matchEpi = e.epi?.toLowerCase().includes(filtro.value.epi.toLowerCase())
    const matchCa = !filtro.value.ca || e.ca === filtro.value.ca
    return matchData && matchFunc && matchEpi && matchCa
  })
}

function limparFiltros() {
  filtro.value = { periodo: 'qualquer', dataInicio: '', dataFim: '', funcionario: '', epi: '', ca: '' }
  entregasFiltradas.value = todasEntregas.value
}

function formatarData(data) {
  if (!data) return '—'
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

function isVencido(v) { return v ? new Date(v) < new Date() : false }

async function exportarPDF() {
  const doc = new jsPDF()

  try {
    const img = await fetch(logoSafeEPI).then(r => r.blob()).then(b => new Promise(res => {
      const fr = new FileReader()
      fr.onload = () => res(fr.result)
      fr.readAsDataURL(b)
    }))
    doc.addImage(img, 'JPEG', 14, 10, 22, 22)
  } catch (_) { /* logo opcional */ }

  doc.setFontSize(22)
  doc.setTextColor(30, 58, 95)
  doc.text('SafeEPI', 42, 22)
  doc.setFontSize(12)
  doc.setTextColor(71, 85, 105)
  doc.text('Relatório de Entregas de EPIs', 42, 30)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 40)
  doc.setTextColor(0)

  autoTable(doc, {
    startY: 46,
    head: [['#', 'Funcionário', 'EPI', 'CA', 'Vencimento CA', 'Validade do EPI', 'Qtd', 'Assinatura', 'Data de Entrega']],
    body: entregasFiltradas.value.map((e, i) => [
      i + 1,
      e.funcionario,
      e.epi,
      e.ca || '—',
      e.validade ? formatarData(e.validade) + (isVencido(e.validade) ? ' (vencido)' : '') : '—',
      e.validade_epi ? formatarData(e.validade_epi) + (isVencido(e.validade_epi) ? ' (vencido)' : '') : 'N/A',
      e.quantidade_entregue || 1,
      e.assinatura_digital ? 'SIM' : 'NÃO',
      formatarData(e.data)
    ]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] }
  })

  doc.save(`relatorio-epis-${filtro.value.dataInicio || 'geral'}.pdf`)
}

function imprimir() { window.print() }

onMounted(carregar)
</script>

<style scoped>
.resumo-badge {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  padding: .3rem .75rem;
  border-radius: 20px;
  font-size: .8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: .4rem;
}

.nome-cell { display: flex; align-items: center; gap: .6rem; font-weight: 500; color: #0f172a; }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: #e0e7ff; color: #3730a3;
  display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0;
}
.row-num { color: #94a3b8; font-size: .8rem; width: 40px; }
.text-center { text-align: center; }
.badge-ok   { background: #dcfce7; color: #166534; }
.badge-warn { background: #fee2e2; color: #991b1b; }
.badge-vencido { background: #fee2e2; color: #991b1b; }
.ca-code {
  background: #f1f5f9; color: #475569;
  padding: .15rem .45rem; border-radius: 4px;
  font-size: .78rem; font-family: monospace;
}
.badge-na {
  background: #f1f5f9; color: #64748b;
  padding: .15rem .55rem; border-radius: 12px;
  font-size: .75rem; font-weight: 600;
}

/* Header de impressão (só visível na impressão) */
.print-header { display: none; }

@media print {
  .no-print { display: none !important; }
  .page { padding: .5rem; }
  .card { box-shadow: none; border: 1px solid #e2e8f0; }
  .page-header { display: none; }
  .print-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: .75rem 0;
    margin-bottom: 1rem;
    border-bottom: 2px solid #1E3A5F;
  }
  .print-logo { height: 60px; width: auto; }
  .print-title {
    margin: 0;
    color: #1E3A5F;
    font-size: 1.8rem;
    font-weight: 700;
  }
  .print-sub {
    margin: 0;
    color: #475569;
    font-size: .95rem;
  }
}
</style>
