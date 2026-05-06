<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Estoque de EPIs</h1>
        <p>Registre entradas e saídas e acompanhe o saldo por equipamento</p>
      </div>
    </header>

    <!-- ── STATS ── -->
    <div class="stats-grid">
      <div class="stat-card" style="border-left-color:#3b82f6">
        <div class="stat-icon" style="background:#eff6ff;color:#3b82f6"><i class="fas fa-boxes"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalEPIs }}</span>
          <span class="stat-label">EPIs com movimentação</span>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#22c55e">
        <div class="stat-icon" style="background:#f0fdf4;color:#22c55e"><i class="fas fa-arrow-down"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalEntradas }}</span>
          <span class="stat-label">Total entradas (un.)</span>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#ef4444">
        <div class="stat-icon" style="background:#fef2f2;color:#ef4444"><i class="fas fa-arrow-up"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalSaidas }}</span>
          <span class="stat-label">Total saídas (un.)</span>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#f97316">
        <div class="stat-icon" style="background:#fff7ed;color:#f97316"><i class="fas fa-layer-group"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ saldoTotal }}</span>
          <span class="stat-label">Saldo total (un.)</span>
        </div>
      </div>
    </div>

    <!-- ── FORMULÁRIO ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-exchange-alt"></i> Registrar Movimentação</h2>
      </div>
      <div class="card-body">
        <div v-if="msg" :class="['alert', msg.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          <i :class="msg.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ msg.texto }}
        </div>

        <form @submit.prevent="registrar">
          <div class="form-grid">
            <div class="field">
              <label>EPI</label>
              <select v-model="form.epi_id" required>
                <option disabled value="">Selecione o EPI</option>
                <option v-for="e in epis" :key="e.id" :value="e.id">{{ e.nome }}</option>
              </select>
            </div>
            <div class="field">
              <label>Tipo</label>
              <select v-model="form.tipo" required>
                <option disabled value="">Selecione o tipo</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div class="field">
              <label>Quantidade</label>
              <input v-model.number="form.quantidade" type="number" min="1" placeholder="Ex: 10" required />
            </div>
            <div class="field">
              <label>Data</label>
              <input v-model="form.data" type="date" required />
            </div>
            <div class="field" style="grid-column: 1 / -1">
              <label>Observação <span style="color:#94a3b8;font-weight:400">(opcional)</span></label>
              <input v-model="form.observacao" type="text" placeholder="Ex: Compra de fornecedor X" />
            </div>
          </div>
          <div class="form-actions" style="margin-top:.5rem">
            <button type="submit" class="btn-primary" :disabled="salvando">
              <i v-if="salvando" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-plus"></i>
              {{ salvando ? 'Registrando...' : 'Registrar' }}
            </button>
            <button type="button" class="btn-outline" @click="limpar">
              <i class="fas fa-times"></i> Limpar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── SALDO POR EPI ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-warehouse"></i> Saldo por EPI</h2>
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input v-model="buscaSaldo" type="text" placeholder="Buscar EPI..." />
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>EPI</th>
              <th>Entradas</th>
              <th>Saídas</th>
              <th>Saldo</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in saldoFiltrado"
              :key="item.epi_id"
              :class="{ 'row-baixo': item.saldo <= 5 }"
            >
              <td class="nome-epi">{{ item.nome }}</td>
              <td><span class="mov-entrada">+{{ item.entradas }}</span></td>
              <td><span class="mov-saida">-{{ item.saidas }}</span></td>
              <td>
                <span :class="['qty-num', item.saldo <= 5 ? 'qty-low' : '']">
                  {{ item.saldo }} un.
                </span>
              </td>
              <td>
                <span :class="['badge', item.saldo === 0 ? 'badge-vencido' : item.saldo <= 5 ? 'badge-baixo' : 'badge-ok']">
                  <i :class="item.saldo === 0 ? 'fas fa-times-circle' : item.saldo <= 5 ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle'"></i>
                  {{ item.saldo === 0 ? 'Zerado' : item.saldo <= 5 ? 'Baixo' : 'OK' }}
                </span>
              </td>
            </tr>
            <tr v-if="saldoFiltrado.length === 0">
              <td colspan="5" class="empty">
                <i class="fas fa-boxes" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ buscaSaldo ? 'Nenhum resultado para "' + buscaSaldo + '"' : 'Nenhuma movimentação registrada' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── HISTÓRICO DE MOVIMENTAÇÕES ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-history"></i> Histórico ({{ movimentacoesFiltradas.length }} registros)</h2>
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input v-model="busca" type="text" placeholder="Buscar EPI..." />
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>EPI</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Data</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in movimentacoesFiltradas" :key="m.id">
              <td class="nome-epi">{{ m.epi?.nome ?? '—' }}</td>
              <td>
                <span :class="['badge', m.tipo === 'entrada' ? 'badge-entrada' : 'badge-saida']">
                  <i :class="m.tipo === 'entrada' ? 'fas fa-arrow-down' : 'fas fa-arrow-up'"></i>
                  {{ m.tipo === 'entrada' ? 'Entrada' : 'Saída' }}
                </span>
              </td>
              <td><span class="qty-num">{{ m.quantidade }} un.</span></td>
              <td>{{ formatarData(m.data) }}</td>
              <td style="color:#64748b;font-size:.85rem">{{ m.observacao || '—' }}</td>
              <td>
                <button class="btn-sm btn-del" @click="excluir(m.id)">
                  <i class="fas fa-trash"></i> Excluir
                </button>
              </td>
            </tr>
            <tr v-if="movimentacoesFiltradas.length === 0">
              <td colspan="6" class="empty">
                <i class="fas fa-history" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ busca ? 'Nenhum resultado para "' + busca + '"' : 'Nenhuma movimentação registrada' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const movimentacoes = ref([])
const epis          = ref([])
const busca         = ref('')
const buscaSaldo    = ref('')
const loading       = ref(true)
const salvando      = ref(false)
const msg           = ref(null)

const form = reactive({ epi_id: '', tipo: '', quantidade: null, data: '', observacao: '' })

// ── Histórico filtrado ──
const movimentacoesFiltradas = computed(() => {
  if (!busca.value) return movimentacoes.value
  const q = busca.value.toLowerCase()
  return movimentacoes.value.filter(m => m.epi?.nome?.toLowerCase().includes(q))
})

// ── Saldo agrupado por EPI ──
const saldoPorEpi = computed(() => {
  const mapa = new Map()
  for (const m of movimentacoes.value) {
    const id = m.epi_id
    if (!mapa.has(id)) {
      mapa.set(id, { epi_id: id, nome: m.epi?.nome ?? '—', entradas: 0, saidas: 0 })
    }
    const r = mapa.get(id)
    if (m.tipo === 'entrada') r.entradas += m.quantidade
    else r.saidas += m.quantidade
  }
  return [...mapa.values()].map(r => ({ ...r, saldo: r.entradas - r.saidas }))
})

const saldoFiltrado = computed(() => {
  if (!buscaSaldo.value) return saldoPorEpi.value
  const q = buscaSaldo.value.toLowerCase()
  return saldoPorEpi.value.filter(r => r.nome.toLowerCase().includes(q))
})

// ── Stat cards ──
const totalEPIs    = computed(() => saldoPorEpi.value.length)
const totalEntradas = computed(() => movimentacoes.value.filter(m => m.tipo === 'entrada').reduce((s, m) => s + m.quantidade, 0))
const totalSaidas   = computed(() => movimentacoes.value.filter(m => m.tipo === 'saida').reduce((s, m) => s + m.quantidade, 0))
const saldoTotal    = computed(() => totalEntradas.value - totalSaidas.value)

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 4000)
}

function limpar() {
  Object.assign(form, { epi_id: '', tipo: '', quantidade: null, data: '', observacao: '' })
}

const carregar = async () => {
  loading.value = true
  const [{ data: epiData }, { data: movData, error }] = await Promise.all([
    supabase.from('epi').select('id, nome').order('nome'),
    supabase
      .from('estoque')
      .select('id, tipo, quantidade, data, observacao, epi_id, epi(id, nome)')
      .order('data', { ascending: false })
  ])
  if (error) showMsg('Erro ao carregar: ' + error.message, 'err')
  epis.value          = epiData  || []
  movimentacoes.value = movData  || []
  loading.value = false
}

async function registrar() {
  salvando.value = true
  const { error } = await supabase.from('estoque').insert([{
    epi_id:     form.epi_id,
    tipo:       form.tipo,
    quantidade: form.quantidade,
    data:       form.data,
    observacao: form.observacao || null
  }])
  salvando.value = false
  if (error) { showMsg('Erro ao registrar: ' + error.message, 'err'); return }
  showMsg(`Movimentação registrada com sucesso!`)
  limpar()
  carregar()
}

async function excluir(id) {
  if (!confirm('Deseja excluir esta movimentação?')) return
  const { error } = await supabase.from('estoque').delete().eq('id', id)
  if (error) showMsg('Erro ao excluir: ' + error.message, 'err')
  else carregar()
}

function formatarData(v) {
  if (!v) return '—'
  const d = new Date(v + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

onMounted(carregar)
</script>

<style scoped>
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  border-left: 4px solid transparent;
}
.stat-icon {
  width: 46px; height: 46px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.15rem; flex-shrink: 0;
}
.stat-info { display: flex; flex-direction: column; }
.stat-val   { font-size: 1.9rem; font-weight: 700; color: #0f172a; line-height: 1; }
.stat-label { font-size: .78rem; color: #64748b; margin-top: .3rem; }

.nome-epi { font-weight: 600; color: #0f172a; }

.qty-num  { font-weight: 700; font-size: .95rem; color: #0f172a; }
.qty-low  { color: #dc2626; }

.mov-entrada { color: #16a34a; font-weight: 700; }
.mov-saida   { color: #dc2626; font-weight: 700; }

.badge-entrada { background: #dcfce7; color: #166534; }
.badge-saida   { background: #fee2e2; color: #991b1b; }
.badge-baixo   { background: #fff7ed; color: #9a3412; }

.row-baixo { background: #fff7ed !important; }
</style>
