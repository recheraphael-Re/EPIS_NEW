<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Visão geral do sistema de gestão de EPIs</p>
      </div>
    </header>

    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card" v-for="s in stats" :key="s.label" :style="{ borderLeftColor: s.color }">
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

const { supabase } = useSupabase()

const totalFuncionarios = ref(0)
const totalEPIs = ref(0)
const episVencidos = ref(0)
const totalEntregas = ref(0)
const entregasRecentes = ref([])
const loading = ref(true)

const stats = computed(() => [
  { label: 'Funcionários',      value: totalFuncionarios.value, icon: 'fas fa-users',               color: '#3b82f6', bg: '#eff6ff' },
  { label: 'EPIs Cadastrados',  value: totalEPIs.value,          icon: 'fas fa-hard-hat',            color: '#22c55e', bg: '#f0fdf4' },
  { label: 'EPIs Vencidos',     value: episVencidos.value,       icon: 'fas fa-exclamation-triangle', color: '#ef4444', bg: '#fef2f2' },
  { label: 'Entregas Realizadas', value: totalEntregas.value,    icon: 'fas fa-box-open',            color: '#f97316', bg: '#fff7ed' },
])

const carregar = async () => {
  loading.value = true
  const hoje = new Date().toISOString().split('T')[0]

  const [
    { count: cf },
    { count: ce },
    { count: cv },
    { count: cnt },
    { data: rec }
  ] = await Promise.all([
    supabase.from('funcionarios').select('*', { count: 'exact', head: true }),
    supabase.from('epi').select('*', { count: 'exact', head: true }),
    supabase.from('epi').select('*', { count: 'exact', head: true }).lt('validade', hoje),
    supabase.from('entregas').select('*', { count: 'exact', head: true }),
    supabase.from('entregas').select('id, data, funcionarios(nome), epi(nome)').order('data', { ascending: false }).limit(5)
  ])

  totalFuncionarios.value = cf || 0
  totalEPIs.value = ce || 0
  episVencidos.value = cv || 0
  totalEntregas.value = cnt || 0
  entregasRecentes.value = rec || []
  loading.value = false
}

function formatarData(data) {
  if (!data) return '-'
  const d = new Date(data + 'T00:00:00')
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
  width: 46px;
  height: 46px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.stat-info { display: flex; flex-direction: column; }
.stat-val { font-size: 1.9rem; font-weight: 700; color: #0f172a; line-height: 1; }
.stat-label { font-size: 0.78rem; color: #64748b; margin-top: 0.3rem; }

.nome-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 500;
  color: #0f172a;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #e0e7ff;
  color: #3730a3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
  text-transform: uppercase;
}
</style>
