<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h1>Entregas de EPI</h1>
        <p>Registre e acompanhe as entregas realizadas aos colaboradores</p>
      </div>
    </header>

    <!-- ── FORMULÁRIO ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-box-open"></i> Registrar Nova Entrega</h2>
      </div>
      <div class="card-body">
        <div v-if="msg" :class="['alert', msg.tipo === 'ok' ? 'alert-success' : 'alert-error']">
          <i :class="msg.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ msg.texto }}
        </div>

        <form @submit.prevent="registrarEntrega">
          <div class="form-grid" style="grid-template-columns: 1fr 1fr; margin-bottom: 1.25rem">
            <div class="field">
              <label>Funcionário</label>
              <select v-model="form.funcionario_id" required>
                <option disabled value="">Selecione o funcionário</option>
                <option v-for="f in funcionarios" :key="f.id" :value="f.id">{{ f.nome }}</option>
              </select>
            </div>
            <div class="field">
              <label>Data da Entrega</label>
              <input v-model="form.data" type="date" required />
            </div>
          </div>

          <!-- Seleção de múltiplos EPIs -->
          <div class="field">
            <div class="epi-select-header">
              <label>
                EPIs a entregar
                <span v-if="episSelecionados.length" class="count-badge">
                  {{ episSelecionados.length }} selecionado{{ episSelecionados.length > 1 ? 's' : '' }}
                </span>
              </label>
              <div class="search-wrap" style="display:inline-flex">
                <i class="fas fa-search"></i>
                <input v-model="buscaEpi" type="text" placeholder="Filtrar EPIs..." style="min-width:200px" />
              </div>
            </div>

            <div class="epi-lista">
              <label
                v-for="e in episFiltradosForm"
                :key="e.id"
                class="epi-item"
                :class="{
                  'epi-item--selecionado': episSelecionados.includes(e.id),
                  'epi-item--vencido': isVencido(e.validade)
                }"
              >
                <input type="checkbox" :value="e.id" v-model="episSelecionados" class="epi-check" />
                <span class="epi-nome">{{ e.nome }}</span>
                <span v-if="e.ca" class="epi-ca">CA {{ e.ca }}</span>
                <span :class="['badge', isVencido(e.validade) ? 'badge-vencido' : 'badge-ok']" style="margin-left:auto;flex-shrink:0">
                  {{ isVencido(e.validade) ? 'Vencido' : 'Válido' }}
                </span>
                <div v-if="episSelecionados.includes(e.id)" class="qty-wrapper" @click.stop>
                  <label class="qty-label">Quantidade</label>
                  <input
                    type="number"
                    :value="quantidades[e.id] || 1"
                    @input="quantidades[e.id] = +$event.target.value"
                    min="1"
                    class="qty-input"
                  />
                </div>
                <span v-else class="epi-qty">{{ e.quantidade }} un.</span>
              </label>

              <div v-if="episFiltradosForm.length === 0" class="epi-empty">
                <i class="fas fa-hard-hat"></i> Nenhum EPI encontrado
              </div>
            </div>
          </div>

          <!-- Assinatura digital (obrigatória) -->
          <div class="assinatura-field">
            <label class="assinatura-label" :class="{ 'assinatura-ativa': form.assinatura_digital }">
              <input type="checkbox" v-model="form.assinatura_digital" class="assinatura-check" />
              <span class="assinatura-box">
                <i :class="form.assinatura_digital ? 'fas fa-check-square' : 'far fa-square'"></i>
              </span>
              <span>Funcionário assinou o recibo de entrega <strong>(assinatura digital)</strong> <span class="obrigatorio">*obrigatório</span></span>
            </label>
          </div>

          <div class="form-actions" style="margin-top:1.25rem">
            <button type="submit" class="btn-primary" :disabled="salvando || episSelecionados.length === 0 || !form.assinatura_digital">
              <i v-if="salvando" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              {{ salvando ? 'Registrando...' : `Registrar Entrega (${episSelecionados.length} EPI${episSelecionados.length !== 1 ? 's' : ''})` }}
            </button>
            <button type="button" class="btn-outline" @click="limparForm">
              <i class="fas fa-times"></i> Limpar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── TABELA (agrupada por funcionário + data) ── -->
    <div class="card">
      <div class="card-header">
        <h2><i class="fas fa-history"></i> Histórico de Entregas ({{ entregasAgrupadas.length }} registros)</h2>
        <div class="search-wrap">
          <i class="fas fa-search"></i>
          <input v-model="busca" type="text" placeholder="Buscar funcionário..." />
        </div>
      </div>
      <div class="table-wrap">
        <div v-if="loading" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Funcionário</th>
              <th>EPIs Entregues</th>
              <th class="text-center">Qtd</th>
              <th class="text-center">Assinatura</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="grupo in entregasAgrupadas" :key="grupo.chave">
              <td>
                <div class="nome-cell">
                  <span class="avatar">{{ grupo.funcionarioNome?.charAt(0) }}</span>
                  <span style="font-weight:600;color:#0f172a">{{ grupo.funcionarioNome }}</span>
                </div>
              </td>
              <td>
                <div class="epis-badges">
                  <span
                    v-for="epi in grupo.epis"
                    :key="epi.id"
                    class="badge badge-setor"
                    style="margin-bottom:.2rem"
                  >
                    <i class="fas fa-hard-hat"></i> {{ epi.nome }}
                  </span>
                </div>
              </td>
              <td class="text-center">
                <strong>{{ grupo.totalQtd }}</strong>
              </td>
              <td class="text-center">
                <span :class="grupo.assinado ? 'badge badge-ok' : 'badge badge-warn'">
                  <i :class="grupo.assinado ? 'fas fa-check-circle' : 'fas fa-clock'"></i>
                  {{ grupo.assinado ? 'Assinado' : 'Pendente' }}
                </span>
              </td>
              <td>{{ formatarData(grupo.data) }}</td>
              <td>
                <button class="btn-sm btn-del" @click="removerGrupo(grupo.ids)">
                  <i class="fas fa-trash"></i> Excluir
                </button>
              </td>
            </tr>
            <tr v-if="entregasAgrupadas.length === 0">
              <td colspan="6" class="empty">
                <i class="fas fa-box-open" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ busca ? 'Nenhum resultado para "' + busca + '"' : 'Nenhuma entrega registrada' }}
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

const funcionarios   = ref([])
const epis           = ref([])
const entregas       = ref([])
const episSelecionados = ref([])  // array de IDs dos EPIs marcados
const quantidades      = ref({})  // { [epi_id]: number }
const busca          = ref('')
const buscaEpi       = ref('')
const loading        = ref(true)
const salvando       = ref(false)
const msg            = ref(null)

const form = reactive({ funcionario_id: '', data: '', assinatura_digital: false })

// ── Filtro de EPIs no formulário ──
const episFiltradosForm = computed(() => {
  if (!buscaEpi.value) return epis.value
  return epis.value.filter(e =>
    e.nome?.toLowerCase().includes(buscaEpi.value.toLowerCase())
  )
})

// ── Agrupa as entregas por funcionário + data para exibição ──
const entregasAgrupadas = computed(() => {
  const filtradas = busca.value
    ? entregas.value.filter(e =>
        e.funcionarios?.nome?.toLowerCase().includes(busca.value.toLowerCase())
      )
    : entregas.value

  const mapa = new Map()
  for (const e of filtradas) {
    const chave = `${e.funcionario_id}_${e.data}`
    if (!mapa.has(chave)) {
      mapa.set(chave, {
        chave,
        funcionarioNome: e.funcionarios?.nome ?? '—',
        data: e.data,
        epis: [],
        ids: [],
        totalQtd: 0,
        assinado: false
      })
    }
    const grupo = mapa.get(chave)
    if (e.epi) grupo.epis.push(e.epi)
    grupo.ids.push(e.id)
    grupo.totalQtd += e.quantidade_entregue || 1
    if (e.assinatura_digital) grupo.assinado = true
  }
  return [...mapa.values()]
})

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 4000)
}

function limparForm() {
  Object.assign(form, { funcionario_id: '', data: '', assinatura_digital: false })
  episSelecionados.value = []
  quantidades.value = {}
  buscaEpi.value = ''
}

const carregar = async () => {
  loading.value = true
  const [{ data: funcs }, { data: episData }, { data: entData, error }] = await Promise.all([
    supabase.from('funcionarios').select('id, nome').order('nome'),
    supabase.from('epi').select('id, nome, ca, validade, quantidade').order('nome'),
    supabase
      .from('entregas')
      // após rodar o ALTER TABLE, descomente a linha abaixo e remova a de cima:
      // .select('id, data, funcionario_id, quantidade_entregue, assinatura_digital, funcionarios(id, nome), epi(id, nome)')
      .select('id, data, funcionario_id, funcionarios(id, nome), epi(id, nome)')
      .order('data', { ascending: false })
  ])
  if (error) showMsg('Erro ao carregar: ' + error.message, 'err')
  funcionarios.value = funcs   || []
  epis.value         = episData || []
  entregas.value     = entData  || []
  loading.value = false
}

async function registrarEntrega() {
  if (!form.funcionario_id || !form.data) {
    showMsg('Selecione o funcionário e a data.', 'err')
    return
  }
  if (episSelecionados.value.length === 0) {
    showMsg('Selecione pelo menos um EPI.', 'err')
    return
  }
  if (!form.assinatura_digital) {
    showMsg('A assinatura digital do funcionário é obrigatória.', 'err')
    return
  }

  salvando.value = true

  // Cria uma linha por EPI selecionado
  // ATENÇÃO: quantidade_entregue e assinatura_digital serão ativados após rodar o ALTER TABLE no Supabase
  const linhas = episSelecionados.value.map(epi_id => ({
    funcionario_id: form.funcionario_id,
    epi_id,
    data: form.data
    // quantidade_entregue: quantidades.value[epi_id] || 1,
    // assinatura_digital: form.assinatura_digital
  }))

  const { error } = await supabase.from('entregas').insert(linhas)
  salvando.value = false

  if (error) { showMsg('Erro ao registrar: ' + error.message, 'err'); return }

  const qtd = episSelecionados.value.length
  showMsg(`${qtd} EPI${qtd > 1 ? 's entregues' : ' entregue'} com sucesso!`)
  limparForm()
  carregar()
}

async function removerGrupo(ids) {
  const qtd = ids.length
  if (!confirm(`Deseja excluir esta entrega (${qtd} EPI${qtd > 1 ? 's' : ''})?`)) return
  await supabase.from('entregas').delete().in('id', ids)
  carregar()
}

function isVencido(v) { return v ? new Date(v) < new Date() : false }

function formatarData(data) {
  if (!data) return '—'
  const d = new Date(data + 'T00:00:00')
  return d.toLocaleDateString('pt-BR')
}

onMounted(carregar)
</script>

<style scoped>
/* ── Cabeçalho da seleção de EPIs ── */
.epi-select-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: .6rem;
  flex-wrap: wrap;
  gap: .5rem;
}

.count-badge {
  background: #f97316;
  color: #fff;
  padding: .15rem .55rem;
  border-radius: 20px;
  font-size: .72rem;
  font-weight: 700;
  margin-left: .5rem;
}

/* ── Lista de EPIs com checkbox ── */
.epi-lista {
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  max-height: 260px;
  overflow-y: auto;
  background: #fff;
}

.epi-item {
  display: flex;
  align-items: center;
  gap: .65rem;
  padding: .65rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background .12s;
  user-select: none;
}

.epi-item:last-child { border-bottom: none; }
.epi-item:hover { background: #f8fafc; }

.epi-item--selecionado { background: #fff7ed !important; }
.epi-item--selecionado .epi-nome { color: #c2570b; font-weight: 600; }

.epi-item--vencido { opacity: .6; }

.epi-check { width: 16px; height: 16px; accent-color: #f97316; flex-shrink: 0; cursor: pointer; }

.epi-nome  { flex: 1; font-size: .875rem; color: #1e293b; }
.epi-ca    { font-size: .75rem; color: #94a3b8; font-family: monospace; }
.epi-qty   { font-size: .75rem; color: #64748b; flex-shrink: 0; }

.epi-empty {
  padding: 1.5rem;
  text-align: center;
  color: #94a3b8;
  font-size: .875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .5rem;
}

/* ── Badges de EPIs na tabela (empilhados) ── */
.epis-badges { display: flex; flex-wrap: wrap; gap: .3rem; }

/* ── Quantidade inline no item de EPI ── */
.qty-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
}
.qty-label {
  font-size: .65rem;
  font-weight: 700;
  color: #f97316;
  text-transform: uppercase;
  letter-spacing: .03em;
}
.qty-input {
  width: 70px;
  padding: .25rem .4rem;
  border: 1.5px solid #f97316;
  border-radius: 6px;
  font-size: .85rem;
  font-weight: 700;
  color: #c2570b;
  text-align: center;
}

/* ── Assinatura digital ── */
.assinatura-field { margin-top: 1.25rem; }
.assinatura-label {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  cursor: pointer;
  padding: .7rem 1.1rem;
  border-radius: 8px;
  border: 2px solid #cbd5e1;
  background: #f8fafc;
  font-size: .875rem;
  color: #475569;
  transition: all .15s;
  user-select: none;
}
.assinatura-label.assinatura-ativa {
  border-color: #10b981;
  background: #f0fdf4;
  color: #166534;
}
.assinatura-check { display: none; }
.assinatura-box i { font-size: 1.1rem; }
.assinatura-label.assinatura-ativa .assinatura-box i { color: #10b981; }
.obrigatorio { color: #dc2626; font-size: .75rem; font-weight: 700; margin-left: .3rem; }

/* ── Outros ── */
.nome-cell { display: flex; align-items: center; gap: .6rem; }
.avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: #e0e7ff; color: #3730a3;
  display: flex; align-items: center; justify-content: center;
  font-size: .75rem; font-weight: 700; text-transform: uppercase; flex-shrink: 0;
}
.form-actions { display: flex; gap: .75rem; }
.text-center { text-align: center; }
.badge-ok   { background: #dcfce7; color: #166534; }
.badge-warn { background: #fee2e2; color: #991b1b; }
</style>
