<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Estoque de EPIs</h1>
        <p>Monitore a disponibilidade e validade dos equipamentos</p>
      </div>
      <button class="btn-primary" @click="irParaEpi">
        <i class="fas fa-plus"></i> Novo EPI
      </button>
    </header>

    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card" style="border-left-color:#3b82f6">
        <div class="stat-icon" style="background:#eff6ff;color:#3b82f6"><i class="fas fa-boxes"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalEPIs }}</span>
          <span class="stat-label">Total de EPIs</span>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#22c55e">
        <div class="stat-icon" style="background:#f0fdf4;color:#22c55e"><i class="fas fa-check-circle"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalDisponivel }}</span>
          <span class="stat-label">Com validade OK</span>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#ef4444">
        <div class="stat-icon" style="background:#fef2f2;color:#ef4444"><i class="fas fa-exclamation-triangle"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalVencidos }}</span>
          <span class="stat-label">EPIs Vencidos</span>
        </div>
      </div>
      <div class="stat-card" style="border-left-color:#f97316">
        <div class="stat-icon" style="background:#fff7ed;color:#f97316"><i class="fas fa-layer-group"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalQuantidade }}</span>
          <span class="stat-label">Unidades em estoque</span>
        </div>
      </div>
    </div>

    <!-- TABELA -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-warehouse"></i> Inventário</h2>
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
              <th>CA</th>
              <th>Quantidade</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in itensFiltrados" :key="item.id" :class="{ 'row-vencida': isVencido(item.validade) }">
              <td class="nome-epi">{{ item.nome }}</td>
              <td><code class="ca-code">{{ item.ca || '—' }}</code></td>
              <td>
                <div class="qty-bar">
                  <span :class="['qty-num', item.quantidade <= 5 ? 'qty-low' : '']">{{ item.quantidade }}</span>
                  <span class="qty-unit">un.</span>
                </div>
              </td>
              <td>{{ formatarData(item.validade) }}</td>
              <td>
                <span :class="['badge', isVencido(item.validade) ? 'badge-vencido' : 'badge-ok']">
                  <i :class="isVencido(item.validade) ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                  {{ isVencido(item.validade) ? 'Vencido' : 'OK' }}
                </span>
              </td>
              <td>
                <div class="btn-actions">
                  <button class="btn-sm btn-edit" @click="irParaEpi">
                    <i class="fas fa-pen"></i> Editar
                  </button>
                  <button class="btn-sm btn-del" @click="remover(item.id)">
                    <i class="fas fa-trash"></i> Excluir
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="itensFiltrados.length === 0">
              <td colspan="6" class="empty">
                <i class="fas fa-boxes" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ busca ? 'Nenhum resultado para "' + busca + '"' : 'Estoque vazio' }}
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
import { useRouter } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()
const router = useRouter()

const itens = ref([])
const busca = ref('')
const loading = ref(true)

const itensFiltrados = computed(() => {
  if (!busca.value) return itens.value
  return itens.value.filter(i => i.nome?.toLowerCase().includes(busca.value.toLowerCase()))
})

const totalEPIs = computed(() => itens.value.length)
const totalDisponivel = computed(() => itens.value.filter(i => !isVencido(i.validade)).length)
const totalVencidos = computed(() => itens.value.filter(i => isVencido(i.validade)).length)
const totalQuantidade = computed(() => itens.value.reduce((s, i) => s + (Number(i.quantidade) || 0), 0))

const carregar = async () => {
  loading.value = true
  const { data, error } = await supabase.from('epi').select('*').order('nome')
  if (!error) itens.value = data || []
  loading.value = false
}

function isVencido(v) { return v ? new Date(v) < new Date() : false }

function formatarData(v) {
  if (!v) return '—'
  const [a, m, d] = v.split('-')
  return `${d}/${m}/${a}`
}

function irParaEpi() { router.push('/applayout/epi') }

async function remover(id) {
  if (!confirm('Deseja excluir este EPI do estoque?')) return
  await supabase.from('epi').delete().eq('id', id)
  carregar()
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
.stat-val { font-size: 1.9rem; font-weight: 700; color: #0f172a; line-height: 1; }
.stat-label { font-size: .78rem; color: #64748b; margin-top: .3rem; }

.nome-epi { font-weight: 600; color: #0f172a; }
.ca-code { background:#f1f5f9;color:#475569;padding:.15rem .45rem;border-radius:4px;font-size:.78rem;font-family:monospace; }
.qty-bar { display:flex;align-items:baseline;gap:.25rem; }
.qty-num { font-weight: 700; font-size: 1rem; color: #0f172a; }
.qty-low { color: #dc2626; }
.qty-unit { font-size: .75rem; color: #94a3b8; }
.row-vencida { background: #fff5f5 !important; }
</style>
