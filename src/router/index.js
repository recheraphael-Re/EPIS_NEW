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
import { useSupabase } from '../composables/useSupabase'

const routes = [
  { path: '/', component: home },
  { path: '/login', component: login },
  {
    path: '/applayout',
    component: applayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'estoque', component: estoque },
      { path: 'dashboard', component: dashboard },
      { path: 'entrega', component: entrega },
      { path: 'funcionario', component: funcionario },
      { path: 'epi', component: epi },
      { path: 'setor', component: setor },
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
    const { supabase } = useSupabase()
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      return '/login'
    }
  }
})

export default router