<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Cadastro de EPIs</h1>
        <p>Gerencie os equipamentos de proteção individual</p>
      </div>
    </header>

    <!-- FORM -->
    <div class="card">
      <div class="card-header">
        <h2>
          <i :class="editandoId ? 'fas fa-edit' : 'fas fa-plus-circle'"></i>
          {{ editandoId ? 'Editar EPI' : 'Novo EPI' }}
        </h2>
      </div>
      <div class="card-body">
        <div v-if="msg" :class="['alert', msg.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          <i :class="msg.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ msg.texto }}
        </div>
        <form @submit.prevent="salvar">
          <div class="form-grid">
            <div class="field">
              <label>Nome do EPI</label>
              <input v-model="form.nome" type="text" placeholder="Ex: Capacete de segurança" required />
            </div>
            <div class="field">
              <label>Nº CA (Certificado)</label>
              <input v-model="form.ca" type="text" placeholder="Ex: 12345" />
            </div>
            <div class="field">
              <label>Quantidade</label>
              <input v-model="form.quantidade" type="number" min="0" placeholder="0" required />
            </div>
            <div class="field">
              <label>Validade</label>
              <input v-model="form.validade" type="date" required />
            </div>
            <div class="field" style="grid-column: 1 / -1">
              <label>Descrição</label>
              <input v-model="form.descricao" type="text" placeholder="Descrição opcional" />
            </div>
          </div>
          <div style="display:flex;gap:.75rem">
            <button type="submit" class="btn-primary">
              <i :class="editandoId ? 'fas fa-save' : 'fas fa-plus'"></i>
              {{ editandoId ? 'Salvar Alterações' : 'Adicionar EPI' }}
            </button>
            <button v-if="editandoId" type="button" class="btn-outline" @click="cancelarEdicao">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- TABELA -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-hard-hat"></i> EPIs Cadastrados ({{ epi.length }})</h2>
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
              <th>Nome</th>
              <th>CA</th>
              <th>Quantidade</th>
              <th>Validade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in episFiltrados" :key="item.id">
              <td class="nome-epi">{{ item.nome }}</td>
              <td><code class="ca-code">{{ item.ca || '—' }}</code></td>
              <td>
                <span :class="['qtd', item.quantidade <= 5 ? 'qtd-baixa' : '']">
                  {{ item.quantidade }}
                </span>
              </td>
              <td>{{ formatarData(item.validade) }}</td>
              <td>
                <span :class="['badge', isVencido(item.validade) ? 'badge-vencido' : 'badge-ok']">
                  <i :class="isVencido(item.validade) ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                  {{ isVencido(item.validade) ? 'Vencido' : 'Válido' }}
                </span>
              </td>
              <td>
                <div class="btn-actions">
                  <button class="btn-sm btn-edit" @click="prepararEdicao(item)">
                    <i class="fas fa-pen"></i> Editar
                  </button>
                  <button class="btn-sm btn-del" @click="excluir(item.id)">
                    <i class="fas fa-trash"></i> Excluir
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="episFiltrados.length === 0">
              <td colspan="6" class="empty">
                <i class="fas fa-hard-hat" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ busca ? 'Nenhum EPI encontrado para "' + busca + '"' : 'Nenhum EPI cadastrado' }}
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

const epi = ref([])
const editandoId = ref(null)
const busca = ref('')
const loading = ref(true)
const msg = ref(null)

const form = reactive({ nome: '', descricao: '', ca: '', validade: '', quantidade: '' })

const episFiltrados = computed(() => {
  if (!busca.value) return epi.value
  return epi.value.filter(e => e.nome?.toLowerCase().includes(busca.value.toLowerCase()))
})

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 3000)
}

const carregar = async () => {
  loading.value = true
  const { data, error } = await supabase.from('epi').select('*').order('nome')
  if (error) showMsg('Erro ao carregar EPIs.', 'err')
  else epi.value = data || []
  loading.value = false
}

const salvar = async () => {
  const { error } = editandoId.value
    ? await supabase.from('epi').update({ ...form }).eq('id', editandoId.value)
    : await supabase.from('epi').insert([{ ...form }])

  if (error) { showMsg('Erro ao salvar: ' + error.message, 'err'); return }
  showMsg(editandoId.value ? 'EPI atualizado!' : 'EPI cadastrado!')
  cancelarEdicao()
  carregar()
}

const prepararEdicao = (e) => {
  editandoId.value = e.id
  Object.assign(form, { nome: e.nome, descricao: e.descricao, ca: e.ca, validade: e.validade, quantidade: e.quantidade })
}

const excluir = async (id) => {
  if (!confirm('Deseja remover este EPI?')) return
  const { error } = await supabase.from('epi').delete().eq('id', id)
  if (error) showMsg('Erro ao excluir.', 'err')
  else { showMsg('EPI removido.'); carregar() }
}

const cancelarEdicao = () => {
  editandoId.value = null
  Object.assign(form, { nome: '', descricao: '', ca: '', validade: '', quantidade: '' })
}

const isVencido = (v) => v ? new Date(v) < new Date() : false

const formatarData = (v) => {
  if (!v) return '—'
  const [a, m, d] = v.split('-')
  return `${d}/${m}/${a}`
}

onMounted(carregar)
</script>

<style scoped>
.nome-epi { font-weight: 600; color: #0f172a; }
.ca-code {
  background: #f1f5f9; color: #475569;
  padding: .15rem .45rem; border-radius: 4px;
  font-size: .78rem; font-family: monospace;
}
.qtd { font-weight: 700; color: #0f172a; }
.qtd-baixa { color: #dc2626; }
</style>
