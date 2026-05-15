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
      <div class="stat-card" style="border-left-color:#a855f7">
        <div class="stat-icon" style="background:#faf5ff;color:#a855f7"><i class="fas fa-ban"></i></div>
        <div class="stat-info">
          <span class="stat-val">{{ totalBaixas }}</span>
          <span class="stat-label">Total baixas (un.)</span>
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
            <button type="button" class="btn-baixa" @click="abrirModalBaixa">
              <i class="fas fa-ban"></i> Dar Baixa
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
              <th>Baixas</th>
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
              <td><span class="mov-baixa">-{{ item.baixas }}</span></td>
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
              <td colspan="6" class="empty">
                <i class="fas fa-boxes" style="font-size:1.5rem;display:block;margin-bottom:.5rem;color:#cbd5e1"></i>
                {{ buscaSaldo ? 'Nenhum resultado para "' + buscaSaldo + '"' : 'Nenhuma movimentação registrada' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ── MODAL DE BAIXA COM SENHA ── -->
    <div v-if="modalBaixa" class="modal-overlay" @click.self="fecharModalBaixa">
      <div class="modal-card">
        <div class="modal-header">
          <h2><i class="fas fa-ban"></i> Dar Baixa em EPI</h2>
          <button class="modal-close" @click="fecharModalBaixa"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div v-if="msgBaixa" :class="['alert', msgBaixa.tipo === 'ok' ? 'alert-success' : 'alert-error']">
            <i :class="msgBaixa.tipo === 'ok' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
            {{ msgBaixa.texto }}
          </div>

          <form @submit.prevent="confirmarBaixa">
            <div class="field">
              <label>EPI <span class="req">*</span></label>
              <select v-model="formBaixa.epi_id" required>
                <option disabled value="">Selecione o EPI</option>
                <option v-for="e in epis" :key="e.id" :value="e.id">
                  {{ e.nome }} (saldo: {{ saldoDoEpi(e.id) }} un.)
                </option>
              </select>
            </div>

            <div class="field">
              <label>Quantidade <span class="req">*</span></label>
              <input v-model.number="formBaixa.quantidade" type="number" min="1" required />
              <small v-if="formBaixa.epi_id" style="color:#64748b">
                Saldo disponível: <strong>{{ saldoDoEpi(formBaixa.epi_id) }} un.</strong>
              </small>
            </div>

            <div class="field">
              <label>Motivo <span class="req">*</span></label>
              <select v-model="formBaixa.motivo" required>
                <option disabled value="">Selecione o motivo</option>
                <option value="Perda">Perda</option>
                <option value="Dano / Quebra">Dano / Quebra</option>
                <option value="Descarte">Descarte (fim de vida útil)</option>
                <option value="Vencimento">Vencimento</option>
                <option value="Roubo / Extravio">Roubo / Extravio</option>
                <option value="Outro">Outro</option>
              </select>
            </div>

            <div class="field">
              <label>Observação <span style="color:#94a3b8;font-weight:400">(opcional)</span></label>
              <input v-model="formBaixa.observacao" type="text" placeholder="Detalhes adicionais..." />
            </div>

            <div class="field-divider">
              <i class="fas fa-shield-alt"></i> Confirmação de identidade
            </div>

            <div class="field">
              <label>Responsável</label>
              <input :value="usuarioEmail || 'Não autenticado'" type="text" disabled class="input-disabled" />
            </div>

            <div class="field">
              <label>Senha do usuário <span class="req">*</span></label>
              <input
                v-model="formBaixa.senha"
                type="password"
                placeholder="Digite sua senha para confirmar"
                required
                autocomplete="current-password"
              />
              <small style="color:#64748b;font-size:.75rem">
                Por segurança, sua senha é necessária para registrar a baixa.
              </small>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-outline" @click="fecharModalBaixa" :disabled="confirmandoBaixa">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" class="btn-baixa" :disabled="confirmandoBaixa || !usuarioEmail">
                <i v-if="confirmandoBaixa" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                {{ confirmandoBaixa ? 'Confirmando...' : 'Confirmar Baixa' }}
              </button>
            </div>
          </form>
        </div>
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
              <th>Qtd</th>
              <th>Data</th>
              <th>Motivo / Observação</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in movimentacoesFiltradas" :key="m.id">
              <td class="nome-epi">{{ m.epi?.nome ?? '—' }}</td>
              <td>
                <span :class="['badge', m.tipo === 'entrada' ? 'badge-entrada' : m.tipo === 'baixa' ? 'badge-baixa-mov' : 'badge-saida']">
                  <i :class="m.tipo === 'entrada' ? 'fas fa-arrow-down' : m.tipo === 'baixa' ? 'fas fa-ban' : 'fas fa-arrow-up'"></i>
                  {{ m.tipo === 'entrada' ? 'Entrada' : m.tipo === 'baixa' ? 'Baixa' : 'Saída' }}
                </span>
              </td>
              <td><span class="qty-num">{{ m.quantidade }} un.</span></td>
              <td>{{ formatarData(m.data) }}</td>
              <td style="color:#64748b;font-size:.85rem">
                <span v-if="m.motivo" class="motivo-tag">{{ m.motivo }}</span>
                {{ m.observacao || (m.motivo ? '' : '—') }}
              </td>
              <td style="color:#475569;font-size:.8rem">{{ m.usuario_email || '—' }}</td>
              <td>
                <button class="btn-sm btn-del" @click="excluir(m.id)">
                  <i class="fas fa-trash"></i> Excluir
                </button>
              </td>
            </tr>
            <tr v-if="movimentacoesFiltradas.length === 0">
              <td colspan="7" class="empty">
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
const usuarioEmail  = ref('')

const form = reactive({ epi_id: '', tipo: '', quantidade: null, data: '', observacao: '' })

// ── Modal de baixa ──
const modalBaixa     = ref(false)
const confirmandoBaixa = ref(false)
const msgBaixa       = ref(null)
const formBaixa      = reactive({
  epi_id: '', quantidade: 1, motivo: '', observacao: '', senha: ''
})

function saldoDoEpi(epiId) {
  return saldoPorEpi.value.find(s => s.epi_id === epiId)?.saldo ?? 0
}

function abrirModalBaixa() {
  Object.assign(formBaixa, { epi_id: '', quantidade: 1, motivo: '', observacao: '', senha: '' })
  msgBaixa.value = null
  modalBaixa.value = true
}

function fecharModalBaixa() {
  if (confirmandoBaixa.value) return
  modalBaixa.value = false
  formBaixa.senha = ''
}

function showMsgBaixa(texto, tipo = 'ok') {
  msgBaixa.value = { texto, tipo }
  setTimeout(() => { msgBaixa.value = null }, 4000)
}

async function confirmarBaixa() {
  if (!usuarioEmail.value) {
    showMsgBaixa('Usuário não autenticado.', 'err')
    return
  }
  if (!formBaixa.epi_id || !formBaixa.motivo || !formBaixa.senha) {
    showMsgBaixa('Preencha todos os campos obrigatórios.', 'err')
    return
  }
  const saldo = saldoDoEpi(formBaixa.epi_id)
  if (formBaixa.quantidade > saldo) {
    showMsgBaixa(`Saldo insuficiente: disponível ${saldo} un., solicitado ${formBaixa.quantidade}.`, 'err')
    return
  }
  if (formBaixa.quantidade <= 0) {
    showMsgBaixa('Quantidade inválida.', 'err')
    return
  }

  confirmandoBaixa.value = true

  // ── Re-autentica o usuário com a senha digitada ──
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: usuarioEmail.value,
    password: formBaixa.senha
  })

  if (authError) {
    confirmandoBaixa.value = false
    showMsgBaixa('Senha incorreta. Tente novamente.', 'err')
    return
  }

  // ── Registra a baixa ──
  const { error } = await supabase.from('estoque').insert([{
    epi_id:        formBaixa.epi_id,
    tipo:          'baixa',
    quantidade:    formBaixa.quantidade,
    data:          new Date().toISOString().slice(0, 10),
    observacao:    formBaixa.observacao || null,
    motivo:        formBaixa.motivo,
    usuario_email: usuarioEmail.value
  }])

  confirmandoBaixa.value = false

  if (error) {
    showMsgBaixa('Erro ao registrar baixa: ' + error.message, 'err')
    return
  }

  showMsg(`Baixa registrada por ${usuarioEmail.value}.`)
  modalBaixa.value = false
  formBaixa.senha = ''
  carregar()
}

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
      mapa.set(id, { epi_id: id, nome: m.epi?.nome ?? '—', entradas: 0, saidas: 0, baixas: 0 })
    }
    const r = mapa.get(id)
    if (m.tipo === 'entrada') r.entradas += m.quantidade
    else if (m.tipo === 'baixa') r.baixas += m.quantidade
    else r.saidas += m.quantidade
  }
  return [...mapa.values()].map(r => ({ ...r, saldo: r.entradas - r.saidas - r.baixas }))
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
const totalBaixas   = computed(() => movimentacoes.value.filter(m => m.tipo === 'baixa').reduce((s, m) => s + m.quantidade, 0))
const saldoTotal    = computed(() => totalEntradas.value - totalSaidas.value - totalBaixas.value)

function showMsg(texto, tipo = 'ok') {
  msg.value = { texto, tipo }
  setTimeout(() => { msg.value = null }, 4000)
}

function limpar() {
  Object.assign(form, { epi_id: '', tipo: '', quantidade: null, data: '', observacao: '' })
}

async function carregarUsuario() {
  const { data } = await supabase.auth.getUser()
  usuarioEmail.value = data?.user?.email || ''
}

const carregar = async () => {
  loading.value = true
  const [{ data: epiData }, { data: movData, error }] = await Promise.all([
    supabase.from('epi').select('id, nome').order('nome'),
    supabase
      .from('estoque')
      .select('id, tipo, quantidade, data, observacao, motivo, usuario_email, epi_id, epi(id, nome)')
      .order('data', { ascending: false })
  ])
  if (error) showMsg('Erro ao carregar: ' + error.message, 'err')
  epis.value          = epiData  || []
  movimentacoes.value = movData  || []
  loading.value = false
}

async function registrar() {
  // Bloqueia saída que deixaria saldo negativo
  if (form.tipo === 'saida') {
    const saldoAtual = saldoPorEpi.value.find(s => s.epi_id === form.epi_id)?.saldo ?? 0
    if (form.quantidade > saldoAtual) {
      showMsg(`Saldo insuficiente: disponível ${saldoAtual} un., solicitado ${form.quantidade}.`, 'err')
      return
    }
  }

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
  showMsg('Movimentação registrada com sucesso!')
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

onMounted(() => { carregarUsuario(); carregar() })
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
.mov-baixa   { color: #a855f7; font-weight: 700; }

.badge-entrada   { background: #dcfce7; color: #166534; }
.badge-saida     { background: #fee2e2; color: #991b1b; }
.badge-baixa-mov { background: #faf5ff; color: #6b21a8; }
.badge-baixo     { background: #fff7ed; color: #9a3412; }

.motivo-tag {
  display: inline-block;
  background: #faf5ff;
  color: #6b21a8;
  padding: .1rem .5rem;
  border-radius: 6px;
  font-size: .72rem;
  font-weight: 600;
  margin-right: .35rem;
}

.input-disabled {
  background: #f1f5f9 !important;
  color: #475569 !important;
  cursor: not-allowed;
}

.row-baixo { background: #fff7ed !important; }

/* ── Botão e Modal de Baixa ── */
.btn-baixa {
  background: #a855f7;
  color: #fff;
  border: none;
  padding: .55rem 1.1rem;
  border-radius: 8px;
  font-size: .875rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  transition: background .15s, transform .1s;
}
.btn-baixa:hover:not(:disabled) { background: #9333ea; }
.btn-baixa:active:not(:disabled) { transform: scale(.97); }
.btn-baixa:disabled { opacity: .55; cursor: not-allowed; }

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(2px);
}
.modal-card {
  background: #fff;
  border-radius: 14px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  animation: modalIn .2s ease-out;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(-12px) scale(.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid #e2e8f0;
  background: #faf5ff;
  border-radius: 14px 14px 0 0;
}
.modal-header h2 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #6b21a8;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  margin: 0;
}
.modal-close {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1rem;
  cursor: pointer;
  padding: .25rem .5rem;
  border-radius: 6px;
}
.modal-close:hover { background: #f1f5f9; color: #0f172a; }
.modal-body { padding: 1.25rem 1.4rem; display: flex; flex-direction: column; gap: .9rem; }
.modal-body .field { display: flex; flex-direction: column; gap: .3rem; }
.modal-body label { font-size: .8rem; font-weight: 600; color: #334155; }
.modal-body input, .modal-body select {
  padding: .55rem .75rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: .9rem;
  font-family: inherit;
}
.modal-body input:focus, .modal-body select:focus {
  outline: none;
  border-color: #a855f7;
  box-shadow: 0 0 0 3px rgba(168, 85, 247, .15);
}
.req { color: #dc2626; font-weight: 700; }
.field-divider {
  margin-top: .5rem;
  padding-top: .9rem;
  border-top: 1px dashed #cbd5e1;
  font-size: .8rem;
  font-weight: 700;
  color: #6b21a8;
  display: flex;
  align-items: center;
  gap: .4rem;
}
.modal-actions {
  display: flex;
  gap: .6rem;
  justify-content: flex-end;
  margin-top: .5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}
</style>
