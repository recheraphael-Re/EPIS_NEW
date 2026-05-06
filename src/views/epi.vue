<template>
  <div class="layout-container">
    <header class="header-section">
      <h1>Painel de Controle de EPIs</h1>
      <p>Gestão de inventário e rastreabilidade de entregas.</p>
    </header>

    <div v-if="loadingEstoque" class="info-banner">Sincronizando inventário...</div>

    <div class="dashboard-grid">
      <!-- Gráfico 01: Pizza -->
      <div class="card chart-card">
        <div class="card-header"><h3>Saúde do Inventário</h3></div>
        <div class="chart-box">
          <Pie
            v-if="estoqueProcessado.length > 0"
            :data="pieChartData"
            :options="chartOptions"
            :key="'pie-' + componentKey"
          />
          <div v-else class="placeholder">Carregando dados...</div>
        </div>
      </div>

      <!-- Gráfico 02: Barras -->
      <div class="card chart-card">
        <div class="card-header"><h3>Níveis Críticos</h3></div>
        <div class="chart-box">
          <Bar
            v-if="estoqueProcessado.length > 0"
            :data="barChartData"
            :options="chartOptions"
            :key="'bar-' + componentKey"
          />
          <div v-else class="placeholder">Analisando estoque...</div>
        </div>
      </div>
    </div>

    <!-- Filtros e Ações -->
    <div class="card filter-card">
      <div class="form-row">
        <div class="form-group">
          <label>Funcionário</label>
          <select v-model="filtros.funcionario_id">
            <option value="">Todos</option>
            <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.nome }}</option>
          </select>
        </div>
        <div class="form-group"><label>Início</label><input type="date" v-model="filtros.data_inicio" /></div>
        <div class="form-group"><label>Fim</label><input type="date" v-model="filtros.data_fim" /></div>
      </div>
      <div class="action-bar">
        <button class="btn btn-primary" @click="buscarTudo" :disabled="loading">🔄 Atualizar Tudo</button>
        <button class="btn btn-pdf" @click="exportarPDF" :disabled="entregas.length === 0">📄 Gerar Relatório PDF</button>
      </div>
    </div>

    <!-- Registro de Nova Entrega -->
    <div class="card entrega-card">
      <div class="card-header"><h3>Registrar Nova Entrega</h3></div>
      <div class="form-row">
        <div class="form-group">
          <label>Funcionário</label>
          <select v-model="novaEntrega.funcionario_id">
            <option value="">Selecione...</option>
            <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.nome }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>EPI</label>
          <select v-model="novaEntrega.epi_id">
            <option value="">Selecione...</option>
            <option v-for="e in epis" :key="e.id" :value="e.id">{{ e.nome }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Qtd Retirada</label>
          <input type="number" v-model.number="novaEntrega.quantidade_entregue" min="1" placeholder="Ex: 2" />
        </div>
        <div class="form-group">
          <label>Data</label>
          <input type="date" v-model="novaEntrega.data_entrega" />
        </div>
      </div>
      <div class="assinatura-row">
        <label class="flag-label" :class="{ 'flag-ativo': novaEntrega.assinatura_digital }">
          <input type="checkbox" v-model="novaEntrega.assinatura_digital" class="flag-check" />
          <span class="flag-icon">{{ novaEntrega.assinatura_digital ? '✅' : '⬜' }}</span>
          <span>Funcionário assinou o recibo de entrega</span>
        </label>
      </div>
      <div class="action-bar">
        <button class="btn btn-success" @click="registrarEntrega" :disabled="salvando">
          {{ salvando ? 'Salvando...' : '💾 Registrar Entrega' }}
        </button>
        <span v-if="msgEntrega" :class="['msg-inline', msgEntrega.tipo === 'ok' ? 'msg-ok' : 'msg-err']">
          {{ msgEntrega.texto }}
        </span>
      </div>
    </div>

    <!-- Tabela -->
    <div class="card table-card">
      <table class="styled-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Funcionário</th>
            <th>EPI Fornecido</th>
            <th class="text-center">Qtd</th>
            <th class="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in entregas" :key="e.id">
            <td>{{ formatarData(e.data_entrega) }}</td>
            <td><strong>{{ e.funcionarios?.nome || 'Não informado' }}</strong></td>
            <td>{{ e.epis?.nome || 'EPI não vinculado' }}</td>
            <td class="text-center">{{ e.quantidade_entregue }}</td>
            <td class="text-center">
              <span :class="e.assinatura_digital ? 'badge badge-ok' : 'badge badge-warn'">
                {{ e.assinatura_digital ? 'Assinado' : 'Pendente' }}
              </span>
            </td>
          </tr>
          <tr v-if="entregas.length === 0">
            <td colspan="5" class="text-center subtext" style="padding: 20px;">Nenhum registro encontrado para este filtro.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { Pie, Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement)

const { supabase } = useSupabase()
const entregas = ref([])
const funcionarios = ref([])
const epis = ref([])
const estoqueProcessado = ref([])
const loading = ref(false)
const loadingEstoque = ref(false)
const salvando = ref(false)
const componentKey = ref(0)
const filtros = ref({ funcionario_id: '', data_inicio: '', data_fim: '' })
const novaEntrega = ref({ funcionario_id: '', epi_id: '', quantidade_entregue: 1, data_entrega: '', assinatura_digital: false })
const msgEntrega = ref(null)

// GRÁFICOS
const pieChartData = computed(() => {
  const data = estoqueProcessado.value
  return {
    labels: ['Estoque OK', 'Estoque Baixo', 'Esgotado'],
    datasets: [{
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      data: [
        data.filter(i => i.quantidade >= 10).length,
        data.filter(i => i.quantidade < 10 && i.quantidade > 0).length,
        data.filter(i => i.quantidade <= 0).length
      ]
    }]
  }
})

const barChartData = computed(() => {
  const criticos = [...estoqueProcessado.value].sort((a,b) => a.quantidade - b.quantidade).slice(0,5)
  return {
    labels: criticos.map(i => i.nome_epi),
    datasets: [{ label: 'Qtd Atual', backgroundColor: '#ef4444', data: criticos.map(i => i.quantidade) }]
  }
})

const chartOptions = { responsive: true, maintainAspectRatio: false }

// LOGICA DE DADOS
async function carregarEstoqueEfetivo() {
  loadingEstoque.value = true
  try {
    const [resEstoque, resEpis] = await Promise.all([
      supabase.from('estoque').select('*'),
      supabase.from('epis').select('id, nome')
    ])
    const episMap = Object.fromEntries(resEpis.data.map(item => [item.id, item.nome]))
    estoqueProcessado.value = resEstoque.data.map(item => ({
      ...item,
      nome_epi: episMap[item.epi_id] || episMap[item.id_epi] || 'EPI Desconhecido'
    }))
    componentKey.value++
  } catch (err) {
    console.error("Erro estoque:", err)
  } finally {
    loadingEstoque.value = false
  }
}

async function buscarEntregas() {
  loading.value = true
  let query = supabase.from('entregas').select('*, funcionarios(nome), epis(nome, ca)').order('data_entrega', { ascending: false })
  if (filtros.value.funcionario_id) query = query.eq('funcionario_id', filtros.value.funcionario_id)
  if (filtros.value.data_inicio) query = query.gte('data_entrega', filtros.value.data_inicio)
  if (filtros.value.data_fim) query = query.lte('data_entrega', filtros.value.data_fim)
  const { data } = await query
  entregas.value = data || []
  loading.value = false
}

// FUNÇÃO PDF
function exportarPDF() {
  const doc = new jsPDF()
  doc.setFontSize(18)
  doc.text('Relatório de Entregas de EPIs', 14, 20)
  doc.setFontSize(10)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28)

  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Funcionário', 'EPI / CA', 'Qtd', 'Assinatura']],
    body: entregas.value.map(e => [
      formatarData(e.data_entrega),
      e.funcionarios?.nome || 'N/A',
      `${e.epis?.nome || 'N/A'} (CA: ${e.epis?.ca || '-'})`,
      e.quantidade_entregue,
      e.assinatura_digital ? 'SIM' : 'NÃO'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] }
  })

  doc.save(`relatorio-epis-${filtros.value.data_inicio || 'geral'}.pdf`)
}

async function carregarFuncionarios() {
  const { data } = await supabase.from('funcionarios').select('id, nome').order('nome')
  funcionarios.value = data || []
}

async function carregarEpis() {
  const { data } = await supabase.from('epis').select('id, nome').order('nome')
  epis.value = data || []
}

async function registrarEntrega() {
  const { funcionario_id, epi_id, quantidade_entregue, data_entrega, assinatura_digital } = novaEntrega.value
  if (!funcionario_id || !epi_id || !quantidade_entregue || !data_entrega) {
    msgEntrega.value = { tipo: 'err', texto: 'Preencha todos os campos obrigatórios.' }
    setTimeout(() => { msgEntrega.value = null }, 3000)
    return
  }
  salvando.value = true
  const { error } = await supabase.from('entregas').insert([{ funcionario_id, epi_id, quantidade_entregue, data_entrega, assinatura_digital }])
  salvando.value = false
  if (error) {
    msgEntrega.value = { tipo: 'err', texto: 'Erro ao registrar: ' + error.message }
  } else {
    msgEntrega.value = { tipo: 'ok', texto: 'Entrega registrada com sucesso!' }
    novaEntrega.value = { funcionario_id: '', epi_id: '', quantidade_entregue: 1, data_entrega: '', assinatura_digital: false }
    buscarEntregas()
  }
  setTimeout(() => { msgEntrega.value = null }, 3000)
}

const buscarTudo = () => { carregarEstoqueEfetivo(); buscarEntregas(); }
const formatarData = (d) => d ? new Date(d).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '—'

onMounted(() => { carregarFuncionarios(); carregarEpis(); buscarTudo(); })
</script>

<style scoped>
/* 1. Fundo totalmente branco no container principal */
.layout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 20px 20px 20px;
  font-family: sans-serif;
  background: #ffffff;
  min-height: 100vh;
}

/* 2. Ajuste do cabeçalho para subir o texto */
.header-section {
  margin-bottom: 20px;
  margin-top: 0;
}

.header-section h1 {
  margin-top: 0;
  padding-top: 0;
  font-size: 1.8rem;
}

.header-section p {
  margin-top: -5px;
  color: #64748b;
}

/* 3. Ajuste nos Cards para destacar no fundo branco */
.card {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.info-banner {
  background: #f0f9ff;
  color: #0369a1;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 15px;
  font-size: 0.8rem;
  text-align: center;
  border: 1px solid #e0f2fe;
}

.dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px; }
.chart-box { height: 250px; position: relative; }
.filter-card { margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 5px; font-size: 0.8rem; font-weight: bold; color: #475569; }
input, select { padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.action-bar { margin-top: 15px; display: flex; gap: 10px; }
.btn { padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-primary { background: #2563eb; color: white; }
.btn-pdf { background: #10b981; color: white; }
.btn:disabled { background: #cbd5e1; cursor: not-allowed; }
.styled-table { width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden; }
.styled-table th { background: #f8fafc; padding: 12px; text-align: left; font-size: 0.75rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #edf2f7; }
.styled-table td { padding: 12px; border-top: 1px solid #f1f5f9; font-size: 0.9rem; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; }
.badge-ok { background: #dcfce7; color: #166534; }
.badge-warn { background: #fee2e2; color: #991b1b; }
.text-center { text-align: center; }
.placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
.entrega-card { margin-bottom: 20px; }
.entrega-card .card-header { margin-bottom: 15px; }
.entrega-card .card-header h3 { margin: 0; font-size: 1rem; color: #1e293b; }
.assinatura-row { margin-top: 15px; }
.flag-label { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 16px; border-radius: 8px; border: 2px solid #cbd5e1; background: #f8fafc; font-size: 0.85rem; color: #475569; font-weight: 600; transition: all 0.2s; user-select: none; }
.flag-label.flag-ativo { border-color: #10b981; background: #f0fdf4; color: #166534; }
.flag-check { display: none; }
.flag-icon { font-size: 1.1rem; }
.btn-success { background: #10b981; color: white; }
.msg-inline { font-size: 0.85rem; font-weight: 600; padding: 8px 12px; border-radius: 6px; }
.msg-ok { background: #dcfce7; color: #166534; }
.msg-err { background: #fee2e2; color: #991b1b; }
</style>
