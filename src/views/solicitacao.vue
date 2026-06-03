<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Solicitação de EPIs</h1>
        <p>Solicite equipamentos para um funcionário; o administrador aprova e gera a entrega.</p>
      </div>
    </header>

    <!-- FORM -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-paper-plane"></i> Nova Solicitação</h2>
      </div>
      <div class="card-body">
        <div v-if="msg" :class="['alert', msg.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          <i :class="msg.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ msg.texto }}
        </div>
        <form @submit.prevent="solicitar">
          <div class="form-grid">
            <div class="field">
              <label>Funcionário</label>
              <select v-model="form.funcionario_id" required>
                <option value="" disabled>Selecione...</option>
                <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.nome }}</option>
              </select>
            </div>
            <div class="field">
              <label>EPI</label>
              <select v-model="form.epi_id" required>
                <option value="" disabled>Selecione...</option>
                <option v-for="e in epis" :key="e.id" :value="e.id">
                  {{ e.nome }} (saldo: {{ saldoDe(e.id) }})
                </option>
              </select>
            </div>
            <div class="field">
              <label>Quantidade</label>
              <input v-model.number="form.quantidade" type="number" min="1" required />
            </div>
            <div class="field" style="grid-column:1/-1">
              <label>Observação (opcional)</label>
              <input v-model="form.observacao" type="text" placeholder="Ex: substituição por desgaste" />
            </div>
          </div>
          <button type="submit" class="btn-primary" :disabled="salvando">
            <i class="fas fa-paper-plane"></i> {{ salvando ? 'Enviando...' : 'Solicitar' }}
          </button>
        </form>
      </div>
    </div>

    <!-- LISTA -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-clipboard-list"></i> Solicitações ({{ listaFiltrada.length }})</h2>
        <div class="header-tools">
          <label class="toggle-inativos">
            <input type="checkbox" v-model="soPendentes" />
            <i class="fas fa-clock"></i> Só pendentes
          </label>
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>EPI</th>
              <th>Qtd</th>
              <th>Solicitante</th>
              <th>Data</th>
              <th>Status</th>
              <th v-if="isAdmin">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in listaFiltrada" :key="s.id">
              <td>{{ s.funcionarios?.nome || '—' }}</td>
              <td>{{ s.epi?.nome || '—' }}</td>
              <td>{{ s.quantidade }}</td>
              <td class="solicitante">{{ s.solicitante_email || '—' }}</td>
              <td>{{ formatarData(s.created_at) }}</td>
              <td>
                <span :class="['badge', statusClasse(s.status)]">
                  <i :class="statusIcone(s.status)"></i> {{ statusLabel(s.status) }}
                </span>
              </td>
              <td v-if="isAdmin">
                <div class="btn-actions" v-if="s.status === 'pendente'">
                  <label class="assinatura-check" :class="{ marcado: assinaturas[s.id] }">
                    <input type="checkbox" v-model="assinaturas[s.id]" />
                    <i class="fas fa-signature"></i> Assinatura digital
                  </label>
                  <button class="btn-sm btn-aprovar" @click="aprovar(s)" :disabled="processandoId === s.id">
                    <i class="fas fa-check"></i> Aprovar
                  </button>
                  <button class="btn-sm btn-rejeitar" @click="rejeitar(s)" :disabled="processandoId === s.id">
                    <i class="fas fa-times"></i> Rejeitar
                  </button>
                </div>
                <span v-else class="decidido">
                  por {{ s.decidido_por || '—' }}
                </span>
              </td>
            </tr>
            <tr v-if="listaFiltrada.length === 0">
              <td :colspan="isAdmin ? 7 : 6" class="empty">
                <i class="fas fa-clipboard-list" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ soPendentes ? 'Nenhuma solicitação pendente' : 'Nenhuma solicitação registrada' }}
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

const { supabase, isAdmin, session } = useSupabase()

const funcionarios = ref([])
const epis = ref([])
const solicitacoes = ref([])
const movEstoque = ref([])
const loading = ref(true)
const salvando = ref(false)
const processandoId = ref(null)
const soPendentes = ref(false)
const msg = ref(null)

const form = reactive({ funcionario_id: '', epi_id: '', quantidade: 1, observacao: '' })

// Confirmação de assinatura digital por solicitação (id -> bool), preenchido pelo admin ao aprovar
const assinaturas = reactive({})

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 4000)
}

// ── Saldo em estoque por EPI (mesma lógica da tela de Entregas) ──
const saldosMapa = computed(() => {
  const m = new Map()
  for (const mov of movEstoque.value) {
    const atual = m.get(mov.epi_id) || 0
    m.set(mov.epi_id, atual + (mov.tipo === 'entrada' ? mov.quantidade : -mov.quantidade))
  }
  return m
})
function saldoDe(epiId) { return saldosMapa.value.get(epiId) || 0 }

const listaFiltrada = computed(() =>
  soPendentes.value ? solicitacoes.value.filter(s => s.status === 'pendente') : solicitacoes.value
)

const carregar = async () => {
  loading.value = true
  const [{ data: funcs }, { data: episData }, { data: solData, error }, { data: movData }] = await Promise.all([
    supabase.from('funcionarios').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('epi').select('id, nome, validade, validade_epi').eq('ativo', true).order('nome'),
    supabase.from('solicitacoes')
      .select('id, funcionario_id, quantidade, status, solicitante_email, observacao, decidido_por, created_at, funcionarios(nome), epi(id, nome)')
      .order('created_at', { ascending: false }),
    supabase.from('estoque').select('epi_id, tipo, quantidade')
  ])
  if (error) showMsg('Erro ao carregar: ' + error.message, 'err')
  funcionarios.value = funcs || []
  epis.value = episData || []
  solicitacoes.value = solData || []
  movEstoque.value = movData || []
  loading.value = false
}

const solicitar = async () => {
  if (!form.funcionario_id || !form.epi_id) { showMsg('Selecione o funcionário e o EPI.', 'err'); return }
  if (!form.quantidade || form.quantidade <= 0) { showMsg('Quantidade inválida.', 'err'); return }

  salvando.value = true
  const { error } = await supabase.from('solicitacoes').insert([{
    funcionario_id: form.funcionario_id,
    epi_id: form.epi_id,
    quantidade: form.quantidade,
    observacao: form.observacao || null,
    solicitante_email: session.value?.user?.email || null,
    status: 'pendente'
  }])
  salvando.value = false

  if (error) { showMsg('Erro ao solicitar: ' + error.message, 'err'); return }
  showMsg('Solicitação enviada! Aguarde a aprovação do administrador.')
  Object.assign(form, { funcionario_id: '', epi_id: '', quantidade: 1, observacao: '' })
  carregar()
}

function isVencido(v) { return v ? new Date(v) < new Date() : false }
function estaVencido(e) { return isVencido(e?.validade) || (e?.validade_epi && isVencido(e.validade_epi)) }

const aprovar = async (s) => {
  const epi = epis.value.find(e => e.id === s.epi?.id)
  const nomeFunc = s.funcionarios?.nome || 'funcionário'

  if (!assinaturas[s.id]) {
    showMsg('Marque "Assinatura digital" para confirmar a entrega antes de aprovar.', 'err'); return
  }
  if (epi && estaVencido(epi)) {
    showMsg(`"${s.epi?.nome}" está vencido. Atualize o cadastro antes de aprovar.`, 'err'); return
  }
  const saldo = saldoDe(s.epi?.id)
  if (s.quantidade > saldo) {
    showMsg(`Estoque insuficiente para "${s.epi?.nome}": pedido ${s.quantidade}, disponível ${saldo}.`, 'err'); return
  }

  processandoId.value = s.id
  const hoje = new Date().toISOString().slice(0, 10)

  // 1) cria a entrega
  const { error: errEnt } = await supabase.from('entregas').insert([{
    funcionario_id: s.funcionario_id,
    epi_id: s.epi?.id,
    data: hoje,
    quantidade_entregue: s.quantidade,
    assinatura_digital: true
  }])
  if (errEnt) { processandoId.value = null; showMsg('Erro ao gerar entrega: ' + errEnt.message, 'err'); return }

  // 2) baixa automática no estoque
  const { error: errEst } = await supabase.from('estoque').insert([{
    epi_id: s.epi?.id,
    tipo: 'saida',
    quantidade: s.quantidade,
    data: hoje,
    observacao: `Entrega via solicitação aprovada (${nomeFunc})`
  }])

  // 3) marca a solicitação como aprovada
  const { error: errUpd } = await supabase.from('solicitacoes')
    .update({ status: 'aprovada', decidido_por: session.value?.user?.email || null, decidido_em: new Date().toISOString() })
    .eq('id', s.id)

  processandoId.value = null
  if (errEst) showMsg('Entrega criada, mas falhou a baixa de estoque: ' + errEst.message, 'err')
  else if (errUpd) showMsg('Entrega criada, mas falhou ao atualizar o status: ' + errUpd.message, 'err')
  else showMsg(`Aprovada! Entrega de ${s.quantidade}x "${s.epi?.nome}" gerada e estoque baixado.`)
  delete assinaturas[s.id]
  carregar()
}

const rejeitar = async (s) => {
  if (!confirm(`Rejeitar a solicitação de "${s.epi?.nome}" para ${s.funcionarios?.nome}?`)) return
  processandoId.value = s.id
  const { error } = await supabase.from('solicitacoes')
    .update({ status: 'rejeitada', decidido_por: session.value?.user?.email || null, decidido_em: new Date().toISOString() })
    .eq('id', s.id)
  processandoId.value = null
  if (error) { showMsg('Erro ao rejeitar: ' + error.message, 'err'); return }
  showMsg('Solicitação rejeitada.')
  carregar()
}

function statusLabel(s) { return { pendente: 'Pendente', aprovada: 'Aprovada', rejeitada: 'Rejeitada' }[s] || s }
function statusClasse(s) { return { pendente: 'badge-pendente', aprovada: 'badge-ok', rejeitada: 'badge-vencido' }[s] || '' }
function statusIcone(s) { return { pendente: 'fas fa-clock', aprovada: 'fas fa-check-circle', rejeitada: 'fas fa-times-circle' }[s] || '' }

function formatarData(v) {
  if (!v) return '—'
  const d = new Date(v)
  return d.toLocaleDateString('pt-BR')
}

onMounted(carregar)
</script>

<style scoped>
.solicitante { font-size: .8rem; color: #64748b; }
.decidido { font-size: .78rem; color: #94a3b8; font-style: italic; }
.header-tools { display: flex; align-items: center; gap: 1rem; }
.toggle-inativos {
  display: inline-flex; align-items: center; gap: .4rem;
  font-size: .8rem; color: #475569; cursor: pointer; user-select: none;
}
.toggle-inativos input { accent-color: #f97316; cursor: pointer; }

.badge-pendente {
  background: #fef3c7; color: #92400e;
}
.btn-actions { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
.assinatura-check {
  display: inline-flex; align-items: center; gap: .35rem;
  font-size: .76rem; color: #64748b; cursor: pointer; user-select: none;
  padding: .25rem .5rem; border: 1px dashed #cbd5e1; border-radius: 6px;
}
.assinatura-check input { accent-color: #16a34a; cursor: pointer; }
.assinatura-check.marcado { color: #166534; border-color: #16a34a; background: #f0fdf4; }
.btn-aprovar {
  background: #dcfce7; color: #166534; border: none;
  padding: .35rem .7rem; border-radius: 6px; font-size: .8rem; font-weight: 600;
  cursor: pointer; display: inline-flex; align-items: center; gap: .35rem; font-family: inherit;
}
.btn-aprovar:hover { background: #bbf7d0; }
.btn-rejeitar {
  background: #fee2e2; color: #991b1b; border: none;
  padding: .35rem .7rem; border-radius: 6px; font-size: .8rem; font-weight: 600;
  cursor: pointer; display: inline-flex; align-items: center; gap: .35rem; font-family: inherit;
}
.btn-rejeitar:hover { background: #fecaca; }
.btn-sm:disabled { opacity: .5; cursor: default; }
</style>
