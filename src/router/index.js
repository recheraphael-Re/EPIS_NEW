import { createRouter, createWebHistory } from 'vue-router'
import home from '../views/home.vue'
import login from '../views/login.vue'
import funcionario from '../views/funcionario.vue'
import estoque from '../views/estoque.vue'
import entrega from '../views/entrega.vue'
import epi from '../views/epi.vue'
import dashboard from '../views/dashboard.vue'
import setor from '../views/setor.vue'
import applayout from '../components/applayout.vue'
import relatorio from '../views/relatorio.vue'
import posse from '../views/posse.vue'
import devolucao from '../views/devolucao.vue'
import menu from '../components/menu.vue'
import footer from '../components/footer.vue'
import { useSupabase } from '../composables/useSupabase'

const routes = [
  { path: '/', component: home },
  { path: '/login', component: login },
  {
    path: '/applayout',
    component: applayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'estoque', component: estoque, meta: { role: 'admin' } },
      { path: 'dashboard', component: dashboard },
      { path: 'entrega', component: entrega },
      { path: 'devolucao', component: devolucao },
      { path: 'posse', component: posse },
      { path: 'funcionario', component: funcionario, meta: { role: 'admin' } },
      { path: 'epi', component: epi, meta: { role: 'admin' } },
      { path: 'setor', component: setor, meta: { role: 'admin' } },
      { path: 'relatorio', component: relatorio }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const { supabase, role, loadRole } = useSupabase()
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return '/login'
    }
    // Rotas restritas a admin
    if (to.meta.role === 'admin') {
      if (role.value == null) await loadRole(data.session)
      if (role.value !== 'admin') {
        return '/applayout/dashboard'
      }
    }
  }
})

export default router