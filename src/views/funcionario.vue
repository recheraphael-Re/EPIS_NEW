<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Funcionários</h1>
        <p>Gerencie o cadastro de colaboradores e organize por setores</p>
      </div>
      <!-- botão sempre visível — garante que o form está em modo NOVO -->
      <button class="btn-primary" @click="novoFuncionario">
        <i class="fas fa-user-plus"></i> Novo Funcionário
      </button>
    </header>

    <!-- ── BANNER DE ALERTA: modo edição ── -->
    <div v-if="editandoId" class="banner-edicao">
      <i class="fas fa-pen-to-square"></i>
      <span>Você está <strong>editando</strong> o funcionário <strong>{{ nomeEditando }}</strong>. Para adicionar um novo, clique em "Novo Funcionário".</span>
      <button class="btn-cancelar-banner" @click="novoFuncionario">
        <i class="fas fa-times"></i> Cancelar edição
      </button>
    </div>

    <!-- ── FORMULÁRIO ── -->
    <div class="card" :class="{ 'card-editando': editandoId }">
      <div class="card-header">
        <h2>
          <i :class="editandoId ? 'fas fa-user-edit' : 'fas fa-user-plus'"></i>
          {{ editandoId ? 'Alterar dados do funcionário' : 'Cadastrar novo funcionário' }}
        </h2>
      </div>
      <div class="card-body">
        <div v-if="msg" :class="['alert', msg.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          <i :class="msg.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ msg.texto }}
        </div>

        <form @submit.prevent="salvar" ref="formEl">
          <div class="form-grid">
            <div class="field">
              <label>Nome Completo</label>
              <input v-model="form.nome" type="text" placeholder="Ex: João da Silva" required />
            </div>
            <div class="field">
              <label>Nº Matrícula</label>
              <input v-model="form.matricula" type="text" placeholder="Ex: SP554" required />
            </div>
            <div class="field">
              <label>Setor</label>
              <input v-model="form.setor" type="text" placeholder="Ex: Manutenção" required />
            </div>
            <div class="field">
              <label>Cargo</label>
              <input v-model="form.cargo" type="text" placeholder="Ex: Operador" required />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" :class="editandoId ? 'btn-update' : 'btn-primary'" :disabled="salvando">
              <i v-if="salvando" class="fas fa-spinner fa-spin"></i>
              <i v-else :class="editandoId ? 'fas fa-save' : 'fas fa-plus'"></i>
              {{ salvando ? 'Salvando...' : editandoId ? 'Salvar Alterações' : 'Cadastrar Funcionário' }}
            </button>
            <button v-if="editandoId" type="button" class="btn-outline" @click="novoFuncionario">
              <i class="fas fa-times"></i> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── TABELA ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-list"></i> Colaboradores ({{ funcionarios.length }})</h2>
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input v-model="busca" type="text" placeholder="Buscar por nome, setor, matrícula..." />
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Carregando...
        </div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Matrícula</th>
              <th>Setor</th>
              <th>Cargo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="f in funcionariosFiltrados"
              :key="f.id"
              :class="{ 'row-editando': f.id === editandoId }"
            >
              <td>
                <div class="nome-cell">
                  <span class="avatar">{{ f.nome?.charAt(0) }}</span>
                  <span class="nome-bold">{{ f.nome }}</span>
                </div>
              </td>
              <td><code class="matricula">{{ f.matricula }}</code></td>
              <td><span class="badge badge-setor">{{ f.setor }}</span></td>
              <td>{{ f.cargo }}</td>
              <td>
                <div class="btn-actions">
                  <button class="btn-sm btn-edit" @click="prepararEdicao(f)">
                    <i class="fas fa-pen"></i> Editar
                  </button>
                  <button class="btn-sm btn-del" @click="excluir(f.id)" :disabled="f.id === editandoId">
                    <i class="fas fa-trash"></i> Excluir
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="funcionariosFiltrados.length === 0">
              <td colspan="5" class="empty">
                <i class="fas fa-users" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ busca ? 'Nenhum resultado para "' + busca + '"' : 'Nenhum funcionário cadastrado' }}
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

const funcionarios  = ref([])
const editandoId    = ref(null)
const nomeEditando  = ref('')
const busca         = ref('')
const loading       = ref(true)
const salvando      = ref(false)
const msg           = ref(null)
const formEl        = ref(null)

const form = reactive({ nome: '', matricula: '', setor: '', cargo: '' })

const funcionariosFiltrados = computed(() => {
  if (!busca.value) return funcionarios.value
  const q = busca.value.toLowerCase()
  return funcionarios.value.filter(f =>
    f.nome?.toLowerCase().includes(q) ||
    f.setor?.toLowerCase().includes(q) ||
    f.matricula?.toLowerCase().includes(q)
  )
})

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 4000)
}

// Sempre reseta para modo INSERT — chamado pelo botão "Novo Funcionário"
function novoFuncionario() {
  editandoId.value  = null
  nomeEditando.value = ''
  Object.assign(form, { nome: '', matricula: '', setor: '', cargo: '' })
  formEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const carregar = async () => {
  loading.value = true
  const { data, error } = await supabase.from('funcionarios').select('*').order('nome')
  if (error) showMsg('Erro ao carregar dados: ' + error.message, 'err')
  else funcionarios.value = data || []
  loading.value = false
}

const salvar = async () => {
  salvando.value = true

  let error
  if (editandoId.value) {
    // ── UPDATE: atualiza o registro existente ──
    ;({ error } = await supabase
      .from('funcionarios')
      .update({ nome: form.nome, matricula: form.matricula, setor: form.setor, cargo: form.cargo })
      .eq('id', editandoId.value))
  } else {
    // ── INSERT: adiciona um NOVO registro ──
    ;({ error } = await supabase
      .from('funcionarios')
      .insert([{ nome: form.nome, matricula: form.matricula, setor: form.setor, cargo: form.cargo }]))
  }

  salvando.value = false

  if (error) {
    const msg_erro = error.code === '23505'
      ? 'Matrícula já cadastrada. Use uma matrícula diferente.'
      : 'Erro ao salvar: ' + error.message
    showMsg(msg_erro, 'err')
    return
  }

  showMsg(editandoId.value ? `Funcionário "${form.nome}" atualizado!` : `Funcionário "${form.nome}" cadastrado!`)
  novoFuncionario()
  carregar()
}

const prepararEdicao = (f) => {
  editandoId.value   = f.id
  nomeEditando.value = f.nome
  Object.assign(form, { nome: f.nome, matricula: f.matricula, setor: f.setor, cargo: f.cargo })
  formEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const excluir = async (id) => {
  if (!confirm('Deseja remover este funcionário?')) return
  const { error } = await supabase.from('funcionarios').delete().eq('id', id)
  if (error) showMsg('Erro ao excluir: ' + error.message, 'err')
  else { showMsg('Funcionário removido.'); carregar() }
}

onMounted(carregar)
</script>

<style scoped>
/* Banner de aviso de modo edição */
.banner-edicao {
  display: flex;
  align-items: center;
  gap: .75rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: .75rem 1.25rem;
  margin-bottom: 1rem;
  font-size: .875rem;
  color: #78350f;
  flex-wrap: wrap;
}
.banner-edicao i { color: #d97706; flex-shrink: 0; }
.banner-edicao span { flex: 1; }

.btn-cancelar-banner {
  padding: .35rem .85rem;
  background: #fff;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  color: #78350f;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  display: flex; align-items: center; gap: .35rem;
  transition: background .15s;
}
.btn-cancelar-banner:hover { background: #fef9c3; }

/* Card com borda laranja no modo edição */
.card-editando { border: 2px solid #f97316 !important; }

/* Botão de update (laranja escuro) */
.btn-update {
  padding: .625rem 1.25rem;
  background: #ea6e0a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: .875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex; align-items: center; gap: .4rem;
  font-family: inherit;
  transition: background .15s;
}
.btn-update:hover { background: #c2570b; }
.btn-update:disabled { opacity: .65; cursor: not-allowed; }

.form-actions { display: flex; gap: .75rem; margin-top: .25rem; }

/* Nome célula */
.nome-cell { display: flex; align-items: center; gap: .6rem; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #e0e7ff; color: #3730a3;
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 700;
  text-transform: uppercase; flex-shrink: 0;
}
.nome-bold { font-weight: 600; color: #0f172a; }
.matricula {
  background: #f1f5f9; color: #475569;
  padding: .15rem .45rem; border-radius: 4px;
  font-size: .78rem; font-family: monospace;
}

/* Linha sendo editada fica destacada */
.row-editando { background: #fff7ed !important; }
.row-editando td { border-left: 3px solid #f97316; }
.row-editando:first-child td { border-left: 3px solid #f97316; }
</style>
