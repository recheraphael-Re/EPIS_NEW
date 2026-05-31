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
              <label>Validade do CA</label>
              <input v-model="form.validade" type="date" required />
            </div>
            <div class="field">
              <label>O EPI tem data de validade?</label>
              <select v-model="form.tem_validade_epi">
                <option :value="false">Não</option>
                <option :value="true">Sim</option>
              </select>
            </div>
            <div class="field" v-if="form.tem_validade_epi">
              <label>Data de validade do EPI</label>
              <input v-model="form.validade_epi" type="date" required />
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
        <h2><i class="fas fa-hard-hat"></i> EPIs Cadastrados ({{ episFiltrados.length }})</h2>
        <div class="header-tools">
          <label class="toggle-inativos">
            <input type="checkbox" v-model="mostrarInativos" />
            <i class="fas fa-eye"></i> Mostrar inativos
          </label>
          <div class="search-wrap">
            <i class="fas fa-search"></i>
            <input v-model="busca" type="text" placeholder="Buscar EPI..." />
          </div>
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CA</th>
              <th>Validade do CA</th>
              <th>Validade do EPI</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in episFiltrados" :key="item.id" :class="{ 'row-inativo': item.ativo === false }">
              <td class="nome-epi">
                {{ item.nome }}
                <span v-if="item.ativo === false" class="badge badge-inativo">Inativo</span>
              </td>
              <td><code class="ca-code">{{ item.ca || '—' }}</code></td>
              <td>{{ formatarData(item.validade) }}</td>
              <td>
                <span v-if="!item.validade_epi" class="badge-na">N/A</span>
                <span v-else :class="['badge', isVencido(item.validade_epi) ? 'badge-vencido' : 'badge-ok']">
                  {{ formatarData(item.validade_epi) }}
                </span>
              </td>
              <td>
                <span :class="['badge', isVencido(item.validade) ? 'badge-vencido' : 'badge-ok']">
                  <i :class="isVencido(item.validade) ? 'fas fa-times-circle' : 'fas fa-check-circle'"></i>
                  {{ isVencido(item.validade) ? 'Vencido' : 'Válido' }}
                </span>
              </td>
              <td>
                <div class="btn-actions">
                  <template v-if="item.ativo !== false">
                    <button class="btn-sm btn-edit" @click="prepararEdicao(item)">
                      <i class="fas fa-pen"></i> Editar
                    </button>
                    <button class="btn-sm btn-del" @click="inativar(item)">
                      <i class="fas fa-ban"></i> Inativar
                    </button>
                  </template>
                  <button v-else class="btn-sm btn-reativar" @click="reativar(item)">
                    <i class="fas fa-rotate-left"></i> Reativar
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
const mostrarInativos = ref(false)
const loading = ref(true)
const msg = ref(null)

const form = reactive({ nome: '', ca: '', validade: '', tem_validade_epi: false, validade_epi: '' })

const episFiltrados = computed(() => {
  let lista = epi.value
  if (!mostrarInativos.value) lista = lista.filter(e => e.ativo !== false)
  if (!busca.value) return lista
  return lista.filter(e => e.nome?.toLowerCase().includes(busca.value.toLowerCase()))
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
  const payload = {
    nome: form.nome,
    ca: form.ca,
    validade: form.validade,
    validade_epi: form.tem_validade_epi ? form.validade_epi : null
  }
  const { error } = editandoId.value
    ? await supabase.from('epi').update(payload).eq('id', editandoId.value)
    : await supabase.from('epi').insert([payload])

  if (error) { showMsg('Erro ao salvar: ' + error.message, 'err'); return }
  showMsg(editandoId.value ? 'EPI atualizado!' : 'EPI cadastrado!')
  cancelarEdicao()
  carregar()
}

const prepararEdicao = (e) => {
  editandoId.value = e.id
  Object.assign(form, {
    nome: e.nome,
    ca: e.ca,
    validade: e.validade,
    tem_validade_epi: !!e.validade_epi,
    validade_epi: e.validade_epi || ''
  })
}

const inativar = async (item) => {
  if (!confirm(`Inativar o EPI "${item.nome}"? Ele deixará de aparecer nas listas e seleções, mas o histórico de movimentações será preservado.`)) return
  const { error } = await supabase.from('epi').update({ ativo: false }).eq('id', item.id)
  if (error) showMsg('Erro ao inativar.', 'err')
  else { showMsg(`EPI "${item.nome}" inativado.`); carregar() }
}

const reativar = async (item) => {
  const { error } = await supabase.from('epi').update({ ativo: true }).eq('id', item.id)
  if (error) showMsg('Erro ao reativar.', 'err')
  else { showMsg(`EPI "${item.nome}" reativado.`); carregar() }
}

const cancelarEdicao = () => {
  editandoId.value = null
  Object.assign(form, { nome: '', ca: '', validade: '', tem_validade_epi: false, validade_epi: '' })
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
.badge-na {
  background: #f1f5f9; color: #64748b;
  padding: .15rem .55rem; border-radius: 12px;
  font-size: .75rem; font-weight: 600;
}

/* Ferramentas do cabeçalho (toggle + busca) */
.header-tools { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.toggle-inativos {
  display: inline-flex; align-items: center; gap: .4rem;
  font-size: .8rem; color: #475569; cursor: pointer; user-select: none;
}
.toggle-inativos input { accent-color: #f97316; cursor: pointer; }

/* EPI inativo */
.row-inativo { opacity: .6; }
.badge-inativo {
  background: #f1f5f9; color: #64748b;
  padding: .1rem .5rem; border-radius: 12px;
  font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .03em; margin-left: .4rem;
}

/* Botão reativar */
.btn-reativar {
  background: #dcfce7; color: #166534; border: none;
  padding: .35rem .7rem; border-radius: 6px;
  font-size: .8rem; font-weight: 600; cursor: pointer;
  display: inline-flex; align-items: center; gap: .35rem;
  font-family: inherit; transition: background .15s;
}
.btn-reativar:hover { background: #bbf7d0; }
</style>
