<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Visão geral do sistema de gestão de EPIs</p>
      </div>
      <div class="header-actions">
        <a href="/apresentacao-cliente.html" target="_blank" rel="noopener" class="btn-pdf-comercial">
          <i class="fas fa-file-pdf"></i>
          PDF Comercial
        </a>
        <div class="periodo-filtro">
          <label>Período:</label>
          <select v-model="periodoSelecionado" @change="carregar">
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="365">Último ano</option>
            <option value="all">Tudo</option>
          </select>
        </div>
      </div>
    </header>

    <!-- ALERTAS ACIONÁVEIS -->
    <div class="alerts-grid" v-if="!loading && (episVencendo.length > 0 || episVencendoProprio.length > 0 || funcionariosSemEntrega.length > 0)">
      <div class="alert-card alert-warning" v-if="episVencendo.length > 0">
        <div class="alert-head">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>CA vencendo em até 30 dias ({{ episVencendo.length }})</h3>
        </div>
        <ul class="alert-list">
          <li v-for="e in episVencendo.slice(0, 5)" :key="e.id">
            <strong>{{ e.nome }}</strong>
            <span class="alert-meta">vence em {{ formatarData(e.validade) }} ({{ diasAte(e.validade) }} dias)</span>
          </li>
          <li v-if="episVencendo.length > 5" class="alert-more">
            + {{ episVencendo.length - 5 }} outro{{ episVencendo.length - 5 > 1 ? 's' : '' }}
          </li>
        </ul>
      </div>

      <div class="alert-card alert-warning" v-if="episVencendoProprio.length > 0">
        <div class="alert-head">
          <i class="fas fa-hourglass-half"></i>
          <h3>Validade do EPI vencendo em até 30 dias ({{ episVencendoProprio.length }})</h3>
        </div>
        <ul class="alert-list">
          <li v-for="e in episVencendoProprio.slice(0, 5)" :key="e.id">
            <strong>{{ e.nome }}</strong>
            <span class="alert-meta">vence em {{ formatarData(e.validade_epi) }} ({{ diasAte(e.validade_epi) }} dias)</span>
          </li>
          <li v-if="episVencendoProprio.length > 5" class="alert-more">
            + {{ episVencendoProprio.length - 5 }} outro{{ episVencendoProprio.length - 5 > 1 ? 's' : '' }}
          </li>
        </ul>
      </div>

      <div class="alert-card alert-info" v-if="funcionariosSemEntrega.length > 0">
        <div class="alert-head">
          <i class="fas fa-user-clock"></i>
          <h3>Funcionários sem entrega há 90+ dias ({{ funcionariosSemEntrega.length }})</h3>
        </div>
        <ul class="alert-list">
          <li v-for="f in funcionariosSemEntrega.slice(0, 5)" :key="f.id">
            <strong>{{ f.nome }}</strong>
            <span class="alert-meta">{{ f.ultimaEntrega ? 'última em ' + formatarData(f.ultimaEntrega) : 'nunca recebeu EPI' }}</span>
          </li>
          <li v-if="funcionariosSemEntrega.length > 5" class="alert-more">
            + {{ funcionariosSemEntrega.length - 5 }} outro{{ funcionariosSemEntrega.length - 5 > 1 ? 's' : '' }}
          </li>
        </ul>
      </div>
    </div>

    <!-- STATS CLICÁVEIS -->
    <div class="stats-grid">
      <RouterLink
        v-for="s in stats"
        :key="s.label"
        :to="s.to"
        class="stat-card"
        :style="{ borderLeftColor: s.color }"
      >
        <div class="stat-icon" :style="{ background: s.bg, color: s.color }">
          <i :class="s.icon"></i>
        </div>
        <div class="stat-info">
          <span class="stat-val">
            <span v-if="loading"><i class="fas fa-spinner fa-spin" style="font-size:.9rem;color:#94a3b8"></i></span>
            <span v-else>{{ s.value }}</span>
          </span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
        <i class="fas fa-chevron-right stat-arrow"></i>
      </RouterLink>
    </div>

    <!-- GRÁFICOS LINHA 1 -->
    <div class="dashboard-grid">
      <div class="card chart-card">
        <div class="card-header"><h2><i class="fas fa-chart-pie"></i> Saúde do Inventário</h2></div>
        <div class="chart-box">
          <Pie v-if="estoqueProcessado.length > 0" :data="pieChartData" :options="chartOptions" :key="'pie-' + chartKey" />
          <div v-else class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        </div>
      </div>
      <div class="card chart-card">
        <div class="card-header"><h2><i class="fas fa-chart-bar"></i> Níveis Críticos</h2></div>
        <div class="chart-box">
          <Bar v-if="estoqueProcessado.length > 0" :data="barChartData" :options="chartOptions" :key="'bar-' + chartKey" />
          <div v-else class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        </div>
      </div>
    </div>

    <!-- GRÁFICOS LINHA 2: Entregas ao longo do tempo (full width) -->
    <div class="card chart-card" style="margin-bottom:1.5rem">
      <div class="card-header"><h2><i class="fas fa-chart-line"></i> Entregas ao Longo do Tempo (últimos 6 meses)</h2></div>
      <div class="chart-box" style="height:280px">
        <Line v-if="entregasMensais.labels.length > 0" :data="entregasMensais" :options="lineOptions" :key="'line-' + chartKey" />
        <div v-else class="chart-placeholder"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
      </div>
    </div>

    <!-- RANKINGS -->
    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header"><h2><i class="fas fa-trophy"></i> Top Funcionários</h2></div>
        <div class="rank-list">
          <div v-if="topFuncionarios.length === 0" class="empty">Sem dados no período</div>
          <div v-for="(f, i) in topFuncionarios" :key="f.nome" class="rank-item">
            <span class="rank-pos" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
            <span class="rank-nome">{{ f.nome }}</span>
            <span class="rank-val">{{ f.total }} EPIs</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h2><i class="fas fa-hard-hat"></i> EPIs Mais Entregues</h2></div>
        <div class="rank-list">
          <div v-if="topEpis.length === 0" class="empty">Sem dados no período</div>
          <div v-for="(e, i) in topEpis" :key="e.nome" class="rank-item">
            <span class="rank-pos" :class="'rank-' + (i + 1)">{{ i + 1 }}</span>
            <span class="rank-nome">{{ e.nome }}</span>
            <span class="rank-val">{{ e.total }} un.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ÚLTIMAS ENTREGAS -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-clock"></i> Últimas Entregas</h2>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Carregando dados...
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>EPI</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in entregasRecentes" :key="e.id">
              <td>
                <div class="nome-cell">
                  <span class="avatar">{{ e.funcionarios?.nome?.charAt(0) }}</span>
                  {{ e.funcionarios?.nome }}
                </div>
              </td>
              <td><span class="badge badge-setor">{{ e.epi?.nome }}</span></td>
              <td>{{ formatarData(e.data) }}</td>
            </tr>
            <tr v-if="entregasRecentes.length === 0">
              <td colspan="3" class="empty">
                <i class="fas fa-inbox" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                Nenhuma entrega registrada ainda
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import { Pie, Bar, Line } from 'vue-chartjs'
import {
  Chart as ChartJS, Title, Tooltip, Legend, ArcElement,
  CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Filler)

const { supabase } = useSupabase()

const periodoSelecionado = ref('90')

const estoqueProcessado = ref([])
const chartKey = ref(0)

const totalFuncionarios = ref(0)
const totalEPIs = ref(0)
const episVencidos = ref(0)
const totalEntregas = ref(0)
const entregasRecentes = ref([])
const episVencendo = ref([])
const episVencendoProprio = ref([])
const funcionariosSemEntrega = ref([])
const topFuncionarios = ref([])
const topEpis = ref([])
const entregasMensais = ref({ labels: [], datasets: [] })
const loading = ref(true)

const pieChartData = computed(() => {
  const d = estoqueProcessado.value
  return {
    labels: ['Estoque OK', 'Estoque Baixo', 'Esgotado'],
    datasets: [{ backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], data: [
      d.filter(i => i.quantidade >= 10).length,
      d.filter(i => i.quantidade < 10 && i.quantidade > 0).length,
      d.filter(i => i.quantidade <= 0).length
    ]}]
  }
})

const barChartData = computed(() => {
  const criticos = [...estoqueProcessado.value].sort((a, b) => a.quantidade - b.quantidade).slice(0, 5)
  return {
    labels: criticos.map(i => i.nome_epi),
    datasets: [{ label: 'Qtd Atual', backgroundColor: '#ef4444', data: criticos.map(i => i.quantidade) }]
  }
})

const chartOptions = { responsive: true, maintainAspectRatio: false }
const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
}

const stats = computed(() => [
  { label: 'Funcionários',        value: totalFuncionarios.value, icon: 'fas fa-users',               color: '#3b82f6', bg: '#eff6ff', to: '/applayout/funcionario' },
  { label: 'EPIs Cadastrados',    value: totalEPIs.value,         icon: 'fas fa-hard-hat',            color: '#22c55e', bg: '#f0fdf4', to: '/applayout/epi' },
  { label: 'EPIs Vencidos',       value: episVencidos.value,      icon: 'fas fa-exclamation-triangle', color: '#ef4444', bg: '#fef2f2', to: '/applayout/epi' },
  { label: 'Entregas Realizadas', value: totalEntregas.value,     icon: 'fas fa-box-open',            color: '#f97316', bg: '#fff7ed', to: '/applayout/entrega' }
])

function dataLimitePeriodo() {
  if (periodoSelecionado.value === 'all') return null
  const dias = parseInt(periodoSelecionado.value)
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().split('T')[0]
}

const carregar = async () => {
  loading.value = true
  const hoje = new Date().toISOString().split('T')[0]
  const daquiA30 = new Date()
  daquiA30.setDate(daquiA30.getDate() + 30)
  const dataLimite30 = daquiA30.toISOString().split('T')[0]

  const limitePeriodo = dataLimitePeriodo()

  // Query base de entregas (filtrada pelo período para stats e rankings)
  let queryEntregas = supabase.from('entregas').select('*', { count: 'exact', head: true })
  if (limitePeriodo) queryEntregas = queryEntregas.gte('data', limitePeriodo)

  const [
    { count: cf },
    { count: ce },
    { count: cv },
    { count: cnt },
    { data: rec },
    { data: vencendo },
    { data: vencendoProprio }
  ] = await Promise.all([
    supabase.from('funcionarios').select('*', { count: 'exact', head: true }),
    supabase.from('epi').select('*', { count: 'exact', head: true }),
    supabase.from('epi').select('*', { count: 'exact', head: true }).lt('validade', hoje),
    queryEntregas,
    supabase.from('entregas').select('id, data, funcionarios(nome), epi(nome)').order('data', { ascending: false }).limit(5),
    supabase.from('epi').select('id, nome, validade').gte('validade', hoje).lte('validade', dataLimite30).order('validade'),
    supabase.from('epi').select('id, nome, validade_epi').not('validade_epi', 'is', null).gte('validade_epi', hoje).lte('validade_epi', dataLimite30).order('validade_epi')
  ])

  totalFuncionarios.value = cf || 0
  totalEPIs.value = ce || 0
  episVencidos.value = cv || 0
  totalEntregas.value = cnt || 0
  entregasRecentes.value = rec || []
  episVencendo.value = vencendo || []
  episVencendoProprio.value = vencendoProprio || []

  // Entregas detalhadas para rankings + funcionários sem entrega + gráfico mensal
  let queryDetalhe = supabase
    .from('entregas')
    .select('data, quantidade_entregue, funcionario_id, epi_id, funcionarios(nome), epi(nome)')
  if (limitePeriodo) queryDetalhe = queryDetalhe.gte('data', limitePeriodo)

  const [{ data: detalhe }, { data: todosFuncs }] = await Promise.all([
    queryDetalhe,
    supabase.from('funcionarios').select('id, nome')
  ])

  // Top funcionários (por quantidade total no período)
  const mapaFunc = new Map()
  for (const e of detalhe || []) {
    const nome = e.funcionarios?.nome
    if (!nome) continue
    mapaFunc.set(nome, (mapaFunc.get(nome) || 0) + (e.quantidade_entregue || 1))
  }
  topFuncionarios.value = [...mapaFunc.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Top EPIs
  const mapaEpi = new Map()
  for (const e of detalhe || []) {
    const nome = e.epi?.nome
    if (!nome) continue
    mapaEpi.set(nome, (mapaEpi.get(nome) || 0) + (e.quantidade_entregue || 1))
  }
  topEpis.value = [...mapaEpi.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  // Funcionários sem entrega há 90+ dias (independente do filtro de período)
  const noventaDiasAtras = new Date()
  noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90)
  const { data: entregasParaSemEntrega } = await supabase
    .from('entregas')
    .select('funcionario_id, data')
    .order('data', { ascending: false })

  const ultimaPorFunc = new Map()
  for (const e of entregasParaSemEntrega || []) {
    if (!ultimaPorFunc.has(e.funcionario_id)) ultimaPorFunc.set(e.funcionario_id, e.data)
  }
  funcionariosSemEntrega.value = (todosFuncs || [])
    .map(f => ({ ...f, ultimaEntrega: ultimaPorFunc.get(f.id) || null }))
    .filter(f => !f.ultimaEntrega || new Date(f.ultimaEntrega) < noventaDiasAtras)

  // Gráfico mensal — últimos 6 meses (independente do filtro de período)
  const seisMeses = new Date()
  seisMeses.setMonth(seisMeses.getMonth() - 5)
  seisMeses.setDate(1)
  const inicioMensal = seisMeses.toISOString().split('T')[0]

  const { data: mensalData } = await supabase
    .from('entregas')
    .select('data, quantidade_entregue')
    .gte('data', inicioMensal)

  const mesesLabels = []
  const mesesValores = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    mesesLabels.push({ chave, label })
    mesesValores[chave] = 0
  }
  for (const e of mensalData || []) {
    const chave = e.data?.slice(0, 7)
    if (chave in mesesValores) mesesValores[chave] += (e.quantidade_entregue || 1)
  }
  entregasMensais.value = {
    labels: mesesLabels.map(m => m.label),
    datasets: [{
      label: 'EPIs entregues',
      data: mesesLabels.map(m => mesesValores[m.chave]),
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.15)',
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#f97316',
      pointRadius: 4
    }]
  }

  loading.value = false

  // Inventário (independente do período)
  const { data: episData, error: erroGrafico } = await supabase
    .from('epi')
    .select('id, nome, quantidade')

  if (erroGrafico) {
    console.error('Erro ao carregar gráficos:', erroGrafico.message)
    return
  }

  estoqueProcessado.value = (episData || []).map(item => ({
    ...item,
    nome_epi: item.nome
  }))
  chartKey.value++
}

function formatarData(data) {
  if (!data) return '-'
  const d = new Date(data + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

function diasAte(data) {
  if (!data) return 0
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const alvo = new Date(data + 'T00:00:00')
  return Math.ceil((alvo - hoje) / (1000 * 60 * 60 * 24))
}

onMounted(carregar)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.periodo-filtro {
  display: flex; align-items: center; gap: .5rem;
  font-size: .85rem; color: #475569;
}
.periodo-filtro select {
  padding: .4rem .75rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  font-size: .85rem;
  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-pdf-comercial {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  background: linear-gradient(135deg, #f97316 0%, #c2570b 100%);
  color: #fff;
  padding: .55rem 1.1rem;
  border-radius: 8px;
  font-size: .85rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
  transition: transform .12s, box-shadow .15s, filter .15s;
}
.btn-pdf-comercial:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(249, 115, 22, 0.4);
  filter: brightness(1.05);
}
.btn-pdf-comercial:active { transform: translateY(0); }
.btn-pdf-comercial i { font-size: .95rem; }

/* Alerts */
.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.alert-card {
  background: #fff;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  border-left: 4px solid;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.alert-warning { border-left-color: #f59e0b; }
.alert-warning .alert-head i { color: #f59e0b; }
.alert-info { border-left-color: #3b82f6; }
.alert-info .alert-head i { color: #3b82f6; }
.alert-head {
  display: flex; align-items: center; gap: .6rem;
  margin-bottom: .75rem;
}
.alert-head h3 {
  margin: 0; font-size: .95rem; color: #1e293b;
}
.alert-list { list-style: none; padding: 0; margin: 0; }
.alert-list li {
  padding: .4rem 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: .85rem;
  display: flex; justify-content: space-between; gap: 1rem;
}
.alert-list li:last-child { border-bottom: none; }
.alert-meta { color: #64748b; font-size: .8rem; }
.alert-more { color: #94a3b8; font-style: italic; justify-content: center !important; }

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border-left: 4px solid transparent;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform .12s, box-shadow .12s;
  position: relative;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.stat-card:hover .stat-arrow { opacity: 1; transform: translateX(2px); }
.stat-arrow {
  margin-left: auto; color: #cbd5e1; font-size: .85rem;
  opacity: 0; transition: opacity .12s, transform .12s;
}

.stat-icon {
  width: 46px; height: 46px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.15rem; flex-shrink: 0;
}
.stat-info { display: flex; flex-direction: column; }
.stat-val { font-size: 1.9rem; font-weight: 700; color: #0f172a; line-height: 1; }
.stat-label { font-size: 0.78rem; color: #64748b; margin-top: 0.3rem; }

/* Charts */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 1.5rem;
}
.chart-card .card-header { margin-bottom: .75rem; }
.chart-card .card-header h2 { font-size: .95rem; color: #1e293b; margin: 0; }
.chart-box { height: 240px; position: relative; }
.chart-placeholder { height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; gap: .5rem; }

/* Rankings */
.rank-list { padding: .5rem 0; }
.rank-item {
  display: flex; align-items: center; gap: .75rem;
  padding: .6rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: .9rem;
}
.rank-item:last-child { border-bottom: none; }
.rank-pos {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .78rem; font-weight: 700;
  background: #f1f5f9; color: #64748b;
  flex-shrink: 0;
}
.rank-pos.rank-1 { background: #fef3c7; color: #b45309; }
.rank-pos.rank-2 { background: #e2e8f0; color: #475569; }
.rank-pos.rank-3 { background: #fed7aa; color: #c2410c; }
.rank-nome { flex: 1; color: #0f172a; font-weight: 500; }
.rank-val { color: #64748b; font-size: .82rem; font-weight: 600; }

/* Tabela */
.nome-cell { display: flex; align-items: center; gap: 0.6rem; font-weight: 500; color: #0f172a; }
.avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: #e0e7ff; color: #3730a3;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0; text-transform: uppercase;
}
.empty { text-align: center; color: #94a3b8; padding: 1rem; font-size: .85rem; }
</style>
