<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Setores</h1>
        <p>Gerencie os setores e departamentos da empresa</p>
      </div>
    </header>

    <!-- FORM -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-plus-circle"></i> Novo Setor</h2>
      </div>
      <div class="card-body">
        <div v-if="msg" :class="['alert', msg.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          <i :class="msg.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ msg.texto }}
        </div>
        <form @submit.prevent="adicionarSetor">
          <div class="form-grid">
            <div class="field">
              <label>Nome do Setor</label>
              <input v-model="novoSetor.nome" type="text" placeholder="Ex: Manutenção Industrial" required />
            </div>
            <div class="field">
              <label>Descrição</label>
              <input v-model="novoSetor.descricao" type="text" placeholder="Ex: Equipe de manutenção de máquinas" />
            </div>
          </div>
          <button type="submit" class="btn-primary">
            <i class="fas fa-plus"></i> Adicionar Setor
          </button>
        </form>
      </div>
    </div>

    <!-- TABELA -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-sitemap"></i> Setores Cadastrados ({{ setores.length }})</h2>
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input v-model="busca" type="text" placeholder="Buscar setor..." />
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Setor</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in setoresFiltrados" :key="s.id">
              <td>
                <div class="setor-cell">
                  <span class="setor-icon"><i class="fas fa-building"></i></span>
                  <span class="setor-nome">{{ s.nome }}</span>
                </div>
              </td>
              <td class="descricao">{{ s.descricao || '—' }}</td>
              <td>
                <button class="btn-sm btn-del" @click="remover(s.id)">
                  <i class="fas fa-trash"></i> Excluir
                </button>
              </td>
            </tr>
            <tr v-if="setoresFiltrados.length === 0">
              <td colspan="3" class="empty">
                <i class="fas fa-sitemap" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ busca ? 'Nenhum resultado para "' + busca + '"' : 'Nenhum setor cadastrado' }}
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

const setores = ref([])
const busca = ref('')
const loading = ref(true)
const msg = ref(null)
const novoSetor = reactive({ nome: '', descricao: '' })

const setoresFiltrados = computed(() => {
  if (!busca.value) return setores.value
  return setores.value.filter(s => s.nome?.toLowerCase().includes(busca.value.toLowerCase()))
})

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 3000)
}

const carregar = async () => {
  loading.value = true
  const { data, error } = await supabase.from('setores').select('*').order('nome')
  if (error) showMsg('Erro ao carregar setores.', 'err')
  else setores.value = data || []
  loading.value = false
}

async function adicionarSetor() {
  if (!novoSetor.nome) return
  const { error } = await supabase.from('setores').insert([{ ...novoSetor }])
  if (error) { showMsg('Erro ao adicionar: ' + error.message, 'err'); return }
  showMsg('Setor adicionado!')
  Object.assign(novoSetor, { nome: '', descricao: '' })
  carregar()
}

async function remover(id) {
  if (!confirm('Deseja excluir este setor?')) return
  await supabase.from('setores').delete().eq('id', id)
  carregar()
}

onMounted(carregar)
</script>

<style scoped>
.setor-cell { display: flex; align-items: center; gap: .6rem; }
.setor-icon {
  width: 30px; height: 30px; border-radius: 8px;
  background: #f0fdf4; color: #16a34a;
  display: flex; align-items: center; justify-content: center;
  font-size: .8rem; flex-shrink: 0;
}
.setor-nome { font-weight: 600; color: #0f172a; }
.descricao { color: #64748b; font-size: .875rem; }
</style>
