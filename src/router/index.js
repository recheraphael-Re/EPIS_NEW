import { createRouter, createWebHistory } from 'vue-router'
import home from '../views/home.vue'
import login from '../views/login.vue'
import funcionario from '../views/funcionario.vue'
import estoque from '../views/estoque.vue'
import entrega from '../views/entrega.vue'
import epi from '../views/epi.vue'
import dashboard from '../views/dashboard.vue'
import fornecedor from '../views/fornecedor.vue'
import setor from '../views/setor.vue'
import applayout from '../components/applayout.vue'
import relatorio from '../views/relatorio.vue'


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
      { path: 'fornecedor', component: fornecedor },
      { path: 'funcionario', component: funcionario },
      { path: 'epi', component: epi },
      { path: 'setor', component: setor},
      { path: 'relatorio', component: relatorio }
    
      ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router