<template>
  <div class="page">
    <!-- Cabeçalho exclusivo para impressão -->
    <div class="print-header">
      <img src="../assets/logoEPI.jpg" alt="SafeEPI" class="print-logo" />
      <div>
        <h1 class="print-title">SafeEPI</h1>
        <p class="print-sub">EPIs em Posse dos Funcionários</p>
      </div>
    </div>

    <header class="page-header">
      <div>
        <h1>EPIs em Posse</h1>
        <p>Veja quais EPIs cada funcionário possui no momento</p>
      </div>
      <div style="display:flex;gap:.6rem">
        <button class="btn-outline no-print" @click="imprimir">
          <i class="fas fa-print"></i> Imprimir
        </button>
        <button class="btn-primary no-print" @click="exportarPDF" :disabled="posseFiltrada.length === 0">
          <i class="fas fa-file-pdf"></i> Exportar PDF
        </button>
      </div>
    </header>

    <!-- STATS -->
    <div class="stats-grid no-print">
      <div class="stat-card" style="border-left-color:#3b82f6">
        <div class="stat-icon" style="background:#eff6ff;color:#3b82f6"><i class="fas fa-users"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ posse.length }}</span>
          <span class="stat-label">Funcionários com EPIs</span>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#f97316">
        <div class="stat-icon" style="background:#fff7ed;color:#f97316"><i class="fas fa-hard-hat"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalEpisEmPosse }}</span>
          <span class="stat-label">EPIs em posse (un.)</span>
        </div>
      </div>
    </div>

    <!-- BUSCA -->
    <div class="card no-print">
      <div class="card-header">
        <h2><i class="fas fa-search"></i> Buscar</h2>
      </div>
      <div class="card-body">
        <div class="search-wrap" style="max-width:420px">
          <i class="fas fa-search"></i>
          <input v-model="busca" type="text" placeholder="Buscar por funcionário, setor ou matrícula..." />
        </div>
      </div>
    </div>

    <!-- LISTA -->
    <div v-if="loading" class="card">
      <div class="loading" style="padding:2rem"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
    </div>

    <div v-else-if="posseFiltrada.length === 0" class="card">
      <div class="empty" style="padding:2.5rem">
        <i class="fas fa-box-open" style="font-size:1.8rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
        {{ busca ? 'Nenhum resultado para "' + busca + '"' : 'Nenhum funcionário possui EPIs no momento' }}
      </div>
    </div>

    <div v-else class="posse-grid">
      <div v-for="f in posseFiltrada" :key="f.id" class="card func-card">
        <div class="func-head">
          <span class="avatar">{{ f.nome?.charAt(0) }}</span>
          <div class="func-info">
            <span class="func-nome">
              {{ f.nome }}
              <span v-if="f.ativo === false" class="badge badge-inativo">Inativo</span>
            </span>
            <span class="func-meta">
              <code class="matricula">{{ f.matricula || '—' }}</code>
              <span class="badge badge-setor">{{ f.setor }}</span>
              {{ f.cargo }}
            </span>
          </div>
          <span class="total-badge">{{ f.totalQtd }} un.</span>
        </div>
        <table class="table table-compacta">
          <thead>
            <tr>
              <th>EPI</th>
              <th>CA</th>
              <th class="text-center">Qtd</th>
              <th>Última entrega</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in f.epis" :key="e.id">
              <td class="nome-epi">{{ e.nome }}</td>
              <td><code class="ca-code">{{ e.ca || '—' }}</code></td>
              <td class="text-center"><strong>{{ e.qtd }}</strong></td>
              <td>{{ formatarData(e.ultimaData) }}</td>
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
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import logoSafeEPI from '../assets/logoEPI.jpg'

const { supabase } = useSupabase()

const posse = ref([])
const busca = ref('')
const loading = ref(true)

const carregar = async () => {
  loading.value = true
  const [{ data, error }, { data: devData }] = await Promise.all([
    supabase
      .from('entregas')
      .select('quantidade_entregue, data, funcionario_id, funcionarios(id, nome, matricula, setor, cargo, ativo), epi(id, nome, ca)')
      .order('data', { ascending: false }),
    supabase.from('devolucoes').select('funcionario_id, epi_id, quantidade')
  ])

  if (error) { loading.value = false; return }

  // Agrupa por funcionário e, dentro dele, por EPI (soma as quantidades entregues)
  const mapaFunc = new Map()
  for (const e of data || []) {
    const f = e.funcionarios
    if (!f) continue
    if (!mapaFunc.has(f.id)) {
      mapaFunc.set(f.id, {
        id: f.id, nome: f.nome, matricula: f.matricula, setor: f.setor,
        cargo: f.cargo, ativo: f.ativo, episMap: new Map()
      })
    }
    const grupo = mapaFunc.get(f.id)
    if (!e.epi) continue
    if (!grupo.episMap.has(e.epi.id)) {
      grupo.episMap.set(e.epi.id, { id: e.epi.id, nome: e.epi.nome, ca: e.epi.ca, qtd: 0, ultimaData: e.data })
    }
    const ep = grupo.episMap.get(e.epi.id)
    ep.qtd += e.quantidade_entregue || 1
    if (e.data > ep.ultimaData) ep.ultimaData = e.data
  }

  // Subtrai as devoluções do total em posse
  for (const d of devData || []) {
    const grupo = mapaFunc.get(d.funcionario_id)
    const ep = grupo?.episMap.get(d.epi_id)
    if (ep) ep.qtd -= d.quantidade
  }

  // Mantém só EPIs com saldo em posse > 0 e funcionários que ainda possuem algo
  posse.value = [...mapaFunc.values()]
    .map(g => {
      const epis = [...g.episMap.values()].filter(e => e.qtd > 0).sort((a, b) => a.nome.localeCompare(b.nome))
      return { ...g, epis, totalQtd: epis.reduce((s, e) => s + e.qtd, 0) }
    })
    .filter(g => g.epis.length > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome))

  loading.value = false
}

const posseFiltrada = computed(() => {
  if (!busca.value) return posse.value
  const q = busca.value.toLowerCase()
  return posse.value.filter(f =>
    f.nome?.toLowerCase().includes(q) ||
    f.setor?.toLowerCase().includes(q) ||
    f.matricula?.toLowerCase().includes(q)
  )
})

const totalEpisEmPosse = computed(() =>
  posse.value.reduce((s, f) => s + f.totalQtd, 0)
)

function formatarData(data) {
  if (!data) return '—'
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

function imprimir() { window.print() }

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
  doc.text('EPIs em Posse dos Funcionários', 42, 30)
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 40)
  doc.setTextColor(0)

  let cursorY = 48
  for (const f of posseFiltrada.value) {
    doc.setFontSize(11)
    doc.setTextColor(30, 58, 95)
    doc.text(`${f.nome}  —  ${f.setor || ''} / ${f.cargo || ''}  (${f.totalQtd} un.)`, 14, cursorY)
    autoTable(doc, {
      startY: cursorY + 3,
      head: [['EPI', 'CA', 'Qtd', 'Última entrega']],
      body: f.epis.map(e => [e.nome, e.ca || '—', e.qtd, formatarData(e.ultimaData)]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 }
    })
    cursorY = doc.lastAutoTable.finalY + 10
    if (cursorY > 270) { doc.addPage(); cursorY = 20 }
  }

  doc.save('epis-em-posse.pdf')
}

onMounted(carregar)
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.stat-card {
  background: #fff; border-radius: 12px; padding: 1.25rem 1.5rem;
  display: flex; align-items: center; gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06); border-left: 4px solid transparent;
}
.stat-icon {
  width: 46px; height: 46px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.15rem; flex-shrink: 0;
}
.stat-info { display: flex; flex-direction: column; }
.stat-val { font-size: 1.9rem; font-weight: 700; color: #0f172a; line-height: 1; }
.stat-label { font-size: .78rem; color: #64748b; margin-top: .3rem; }

.posse-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 1rem;
}
.func-card { padding: 1.1rem 1.25rem; }
.func-head {
  display: flex; align-items: center; gap: .75rem;
  margin-bottom: .85rem; padding-bottom: .85rem;
  border-bottom: 1px solid #f1f5f9;
}
.avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: #e0e7ff; color: #3730a3;
  display: flex; align-items: center; justify-content: center;
  font-size: .95rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0;
}
.func-info { display: flex; flex-direction: column; gap: .25rem; flex: 1; min-width: 0; }
.func-nome { font-weight: 700; color: #0f172a; font-size: 1rem; }
.func-meta {
  display: flex; align-items: center; gap: .4rem; flex-wrap: wrap;
  font-size: .78rem; color: #64748b;
}
.total-badge {
  background: #fff7ed; color: #c2570b;
  padding: .25rem .65rem; border-radius: 20px;
  font-size: .78rem; font-weight: 700; flex-shrink: 0;
}
.table-compacta th, .table-compacta td { padding: .45rem .6rem; font-size: .82rem; }
.text-center { text-align: center; }
.nome-epi { font-weight: 600; color: #0f172a; }
.ca-code {
  background: #f1f5f9; color: #475569;
  padding: .1rem .4rem; border-radius: 4px;
  font-size: .72rem; font-family: monospace;
}
.matricula {
  background: #f1f5f9; color: #475569;
  padding: .1rem .4rem; border-radius: 4px;
  font-size: .72rem; font-family: monospace;
}
.badge-inativo {
  background: #f1f5f9; color: #64748b;
  padding: .1rem .5rem; border-radius: 12px;
  font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .03em; margin-left: .4rem;
}

/* Header de impressão (só visível na impressão) */
.print-header { display: none; }
@media print {
  .no-print { display: none !important; }
  .page { padding: .5rem; }
  .card { box-shadow: none; border: 1px solid #e2e8f0; }
  .page-header { display: none; }
  .posse-grid { grid-template-columns: 1fr; }
  .print-header {
    display: flex; align-items: center; gap: 1rem;
    padding: .75rem 0; margin-bottom: 1rem;
    border-bottom: 2px solid #1E3A5F;
  }
  .print-logo { height: 60px; width: auto; }
  .print-title { margin: 0; color: #1E3A5F; font-size: 1.8rem; font-weight: 700; }
  .print-sub { margin: 0; color: #475569; font-size: .95rem; }
}

@media (max-width: 600px) {
  .posse-grid { grid-template-columns: 1fr; }
}
</style>
