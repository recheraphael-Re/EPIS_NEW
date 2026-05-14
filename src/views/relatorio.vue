<template>
  <div class="page">
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
            <label>Data Inicial</label>
            <input v-model="filtro.dataInicio" type="date" />
          </div>
          <div class="field">
            <label>Data Final</label>
            <input v-model="filtro.dataFim" type="date" />
          </div>
          <div class="field">
            <label>Funcionário</label>
            <input v-model="filtro.funcionario" type="text" placeholder="Nome do funcionário..." />
          </div>
          <div class="field">
            <label>EPI</label>
            <input v-model="filtro.epi" type="text" placeholder="Nome do EPI..." />
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
              <th class="text-center">Qtd</th>
              <th class="text-center">Assinatura</th>
              <th>Data</th>
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
              <td colspan="6" class="empty">
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

const { supabase } = useSupabase()

const todasEntregas = ref([])
const entregasFiltradas = ref([])
const loading = ref(true)

const filtro = ref({ dataInicio: '', dataFim: '', funcionario: '', epi: '' })

const carregar = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('entregas')
    .select('id, data, quantidade_entregue, assinatura_digital, funcionarios(nome), epi(nome)')
    .order('data', { ascending: false })
  if (!error) {
    todasEntregas.value = (data || []).map(e => ({
      ...e,
      funcionario: e.funcionarios?.nome ?? '—',
      epi: e.epi?.nome ?? '—'
    }))
    entregasFiltradas.value = todasEntregas.value
  }
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
    return matchData && matchFunc && matchEpi
  })
}

function limparFiltros() {
  filtro.value = { dataInicio: '', dataFim: '', funcionario: '', epi: '' }
  entregasFiltradas.value = todasEntregas.value
}

function formatarData(data) {
  if (!data) return '—'
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

function exportarPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Relatório de Entregas de EPIs', 14, 20)
  doc.setFontSize(10)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)

  autoTable(doc, {
    startY: 35,
    head: [['#', 'Funcionário', 'EPI', 'Qtd', 'Assinatura', 'Data']],
    body: entregasFiltradas.value.map((e, i) => [
      i + 1,
      e.funcionario,
      e.epi,
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

@media print {
  .no-print { display: none !important; }
  .page { padding: .5rem; }
  .card { box-shadow: none; border: 1px solid #e2e8f0; }
}
</style>
