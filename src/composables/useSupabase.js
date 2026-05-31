import { createClient } from '@supabase/supabase-js'
import { ref, computed } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// estado global reativo
const session = ref(null)
const loadingSession = ref(true)
const role = ref(null)              // 'admin' | 'user' | null
const isAdmin = computed(() => role.value === 'admin')

// Carrega o papel (role) a partir da tabela perfis.
// Recebe a sessão como parâmetro para NÃO chamar getUser() — chamar métodos de
// auth/banco dentro do callback do onAuthStateChange trava o cliente (deadlock do lock interno).
async function loadRole(sess = session.value) {
  const uid = sess?.user?.id
  if (!uid) { role.value = null; return null }
  const { data } = await supabase.from('perfis').select('role').eq('id', uid).single()
  role.value = data?.role ?? 'user'
  return role.value
}

// pega sessão inicial
supabase.auth.getSession().then(({ data }) => {
  session.value = data.session
  loadingSession.value = false
  if (data.session) loadRole(data.session)
})

// escuta mudanças (login/logout) — adia o trabalho para fora do callback (evita deadlock)
supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession
  if (newSession) {
    setTimeout(() => loadRole(newSession), 0)
  } else {
    role.value = null
  }
})

export function useSupabase() {
  return {
    supabase,
    session,
    loadingSession,
    role,
    isAdmin,
    loadRole
  }
}
