<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Devoluções de EPI</h1>
        <p>Registre a devolução de EPIs e reponha o estoque automaticamente</p>
      </div>
    </header>

    <!-- ── FORMULÁRIO ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-undo"></i> Registrar Devolução</h2>
      </div>
      <div class="card-body">
        <div v-if="msg" :class="['alert', msg.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          <i :class="msg.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ msg.texto }}
        </div>

        <form @submit.prevent="registrarDevolucao">
          <div class="form-grid form-grid--2col">
            <div class="field">
              <label>Funcionário</label>
              <select v-model="form.funcionario_id" @change="onFuncionarioChange" required>
                <option disabled value="">Selecione o funcionário</option>
                <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.nome }}</option>
              </select>
            </div>
            <div class="field">
              <label>Data da Devolução</label>
              <input v-model="form.data" type="date" required />
            </div>
          </div>

          <div class="field" v-if="form.funcionario_id">
            <label>EPI a devolver</label>
            <select v-model="form.epi_id" required>
              <option disabled value="">Selecione o EPI</option>
              <option v-for="p in episEmPosse" :key="p.epi_id" :value="p.epi_id">
                {{ p.nome }} — em posse: {{ p.qtd }} un.
              </option>
            </select>
            <small v-if="episEmPosse.length === 0" style="color:#dc2626">
              Este funcionário não possui EPIs em posse.
            </small>
          </div>

          <div class="form-grid form-grid--2col" v-if="form.epi_id">
            <div class="field">
              <label>Quantidade</label>
              <input
                v-model.number="form.quantidade"
                type="number"
                min="1"
                :max="maxDevolver"
                required
              />
              <small style="color:#64748b">Disponível para devolver: <strong>{{ maxDevolver }} un.</strong></small>
            </div>
            <div class="field">
              <label>Condição do EPI</label>
              <select v-model="form.condicao" required>
                <option value="reutilizavel">Reutilizável (volta ao estoque)</option>
                <option value="descarte">Descarte (não retorna ao estoque)</option>
              </select>
            </div>
          </div>

          <div class="field" v-if="form.epi_id">
            <label>Observação <span style="color:#94a3b8;font-weight:400">(opcional)</span></label>
            <input v-model="form.observacao" type="text" placeholder="Ex: devolução por troca de função" />
          </div>

          <div class="form-actions" style="margin-top:1rem">
            <button type="submit" class="btn-primary" :disabled="salvando || !form.epi_id">
              <i v-if="salvando" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-undo"></i>
              {{ salvando ? 'Registrando...' : 'Registrar Devolução' }}
            </button>
            <button type="button" class="btn-outline" @click="limparForm">
              <i class="fas fa-times"></i> Limpar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── HISTÓRICO ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-history"></i> Histórico de Devoluções ({{ devolucoesFiltradas.length }})</h2>
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input v-model="busca" type="text" placeholder="Buscar funcionário ou EPI..." />
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>EPI</th>
              <th class="text-center">Qtd</th>
              <th>Condição</th>
              <th>Data</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in devolucoesFiltradas" :key="d.id">
              <td>
                <div class="nome-cell">
                  <span class="avatar">{{ d.funcionarios?.nome?.charAt(0) }}</span>
                  <span style="font-weight:600;color:#0f172a">{{ d.funcionarios?.nome ?? '—' }}</span>
                </div>
              </td>
              <td><span class="badge badge-setor"><i class="fas fa-hard-hat"></i> {{ d.epi?.nome ?? '—' }}</span></td>
              <td class="text-center"><strong>{{ d.quantidade }}</strong></td>
              <td>
                <span :class="['badge', d.condicao === 'reutilizavel' ? 'badge-ok' : 'badge-descarte']">
                  <i :class="d.condicao === 'reutilizavel' ? 'fas fa-recycle' : 'fas fa-trash-alt'"></i>
                  {{ d.condicao === 'reutilizavel' ? 'Reutilizável' : 'Descarte' }}
                </span>
              </td>
              <td>{{ formatarData(d.data) }}</td>
              <td style="color:#475569;font-size:.8rem">{{ d.usuario_email || '—' }}</td>
              <td>
                <button class="btn-sm btn-del" @click="excluir(d)">
                  <i class="fas fa-trash"></i> Excluir
                </button>
              </td>
            </tr>
            <tr v-if="devolucoesFiltradas.length === 0">
              <td colspan="7" class="empty">
                <i class="fas fa-undo" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ busca ? 'Nenhum resultado para "' + busca + '"' : 'Nenhuma devolução registrada' }}
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

const funcionarios = ref([])
const entregas     = ref([])
const devolucoes   = ref([])
const busca        = ref('')
const loading      = ref(true)
const salvando     = ref(false)
const msg          = ref(null)
const usuarioEmail = ref('')

const form = reactive({
  funcionario_id: '', epi_id: '', quantidade: 1,
  condicao: 'reutilizavel', data: new Date().toISOString().slice(0, 10), observacao: ''
})

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 4000)
}

// ── Saldo "em posse" por funcionário + EPI (entregue − devolvido) ──
const posseMap = computed(() => {
  const m = new Map()
  for (const e of entregas.value) {
    const key = `${e.funcionario_id}_${e.epi_id}`
    if (!m.has(key)) {
      m.set(key, { funcionario_id: e.funcionario_id, epi_id: e.epi_id, nome: e.epi?.nome ?? '—', qtd: 0 })
    }
    m.get(key).qtd += e.quantidade_entregue || 1
  }
  for (const d of devolucoes.value) {
    const key = `${d.funcionario_id}_${d.epi_id}`
    if (m.has(key)) m.get(key).qtd -= d.quantidade
  }
  return m
})

const episEmPosse = computed(() => {
  if (!form.funcionario_id) return []
  return [...posseMap.value.values()]
    .filter(p => p.funcionario_id === form.funcionario_id && p.qtd > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome))
})

const maxDevolver = computed(() => {
  const p = episEmPosse.value.find(x => x.epi_id === form.epi_id)
  return p ? p.qtd : 0
})

const devolucoesFiltradas = computed(() => {
  if (!busca.value) return devolucoes.value
  const q = busca.value.toLowerCase()
  return devolucoes.value.filter(d =>
    d.funcionarios?.nome?.toLowerCase().includes(q) ||
    d.epi?.nome?.toLowerCase().includes(q)
  )
})

function onFuncionarioChange() {
  form.epi_id = ''
  form.quantidade = 1
}

function limparForm() {
  Object.assign(form, {
    funcionario_id: '', epi_id: '', quantidade: 1,
    condicao: 'reutilizavel', data: new Date().toISOString().slice(0, 10), observacao: ''
  })
}

async function carregarUsuario() {
  const { data } = await supabase.auth.getUser()
  usuarioEmail.value = data?.user?.email || ''
}

const carregar = async () => {
  loading.value = true
  const [{ data: funcs }, { data: entData }, { data: devData, error }] = await Promise.all([
    supabase.from('funcionarios').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('entregas').select('funcionario_id, epi_id, quantidade_entregue, epi(id, nome)'),
    supabase
      .from('devolucoes')
      .select('id, funcionario_id, epi_id, quantidade, data, condicao, observacao, usuario_email, funcionarios(nome), epi(nome)')
      .order('data', { ascending: false })
  ])
  if (error) showMsg('Erro ao carregar: ' + error.message, 'err')
  funcionarios.value = funcs   || []
  entregas.value     = entData || []
  devolucoes.value   = devData || []
  loading.value = false
}

async function registrarDevolucao() {
  if (!form.funcionario_id || !form.epi_id || !form.data) {
    showMsg('Preencha funcionário, EPI e data.', 'err')
    return
  }
  if (form.quantidade <= 0) {
    showMsg('Quantidade inválida.', 'err')
    return
  }
  if (form.quantidade > maxDevolver.value) {
    showMsg(`Não é possível devolver ${form.quantidade} un.: o funcionário tem apenas ${maxDevolver.value} em posse.`, 'err')
    return
  }

  salvando.value = true
  const nomeFunc = funcionarios.value.find(f => f.id === form.funcionario_id)?.nome ?? 'funcionário'

  // 1) Registra a devolução
  const { error } = await supabase.from('devolucoes').insert([{
    funcionario_id: form.funcionario_id,
    epi_id:         form.epi_id,
    quantidade:     form.quantidade,
    data:           form.data,
    condicao:       form.condicao,
    observacao:     form.observacao || null,
    usuario_email:  usuarioEmail.value || null
  }])

  if (error) {
    salvando.value = false
    showMsg('Erro ao registrar devolução: ' + error.message, 'err')
    return
  }

  // 2) Reutilizável → repõe o estoque (entrada). Descarte → não retorna ao estoque.
  if (form.condicao === 'reutilizavel') {
    const { error: errEstoque } = await supabase.from('estoque').insert([{
      epi_id:     form.epi_id,
      tipo:       'entrada',
      quantidade: form.quantidade,
      data:       form.data,
      observacao: `Devolução de ${nomeFunc}`
    }])
    if (errEstoque) {
      salvando.value = false
      showMsg('Devolução registrada, mas falhou ao repor o estoque: ' + errEstoque.message, 'err')
      limparForm()
      carregar()
      return
    }
  }

  salvando.value = false
  showMsg(form.condicao === 'reutilizavel'
    ? 'Devolução registrada e estoque reposto!'
    : 'Devolução registrada (descarte — sem retorno ao estoque).')
  limparForm()
  carregar()
}

async function excluir(d) {
  if (!confirm('Excluir esta devolução? Se era reutilizável, o estoque reposto será estornado.')) return

  const { error } = await supabase.from('devolucoes').delete().eq('id', d.id)
  if (error) { showMsg('Erro ao excluir: ' + error.message, 'err'); return }

  // Estorna a reposição feita no estoque (saída compensatória)
  if (d.condicao === 'reutilizavel') {
    await supabase.from('estoque').insert([{
      epi_id:     d.epi_id,
      tipo:       'saida',
      quantidade: d.quantidade,
      data:       new Date().toISOString().slice(0, 10),
      observacao: `Estorno de devolução (${d.funcionarios?.nome ?? 'funcionário'})`
    }])
  }
  showMsg('Devolução excluída.')
  carregar()
}

function formatarData(data) {
  if (!data) return '—'
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

onMounted(() => { carregarUsuario(); carregar() })
</script>

<style scoped>
.form-grid--2col { grid-template-columns: 1fr 1fr; }
.form-actions { display: flex; gap: .75rem; }
.text-center { text-align: center; }
.nome-cell { display: flex; align-items: center; gap: .6rem; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #e0e7ff; color: #3730a3;
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0;
}
.badge-ok       { background: #dcfce7; color: #166534; }
.badge-descarte { background: #fef2f2; color: #991b1b; }

@media (max-width: 600px) {
  .form-grid--2col { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; align-items: stretch; }
  .form-actions .btn-primary, .form-actions .btn-outline { justify-content: center; }
}
</style>
