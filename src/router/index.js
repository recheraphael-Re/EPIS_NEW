import { createRouter, createWebHistory } from 'vue-router'
import home from '../views/home.vue'
import login from '../views/login.vue'
import funcionario from '../views/funcionario.vue'
import estoque from '../views/estoque.vue'
import entrega from '../views/entrega.vue'
import cadastro from '../views/cadastro.vue'
import epi from '../views/epi.vue'
import dashboard from '../views/dashboard.vue'
import fornecedor from '../views/fornecedor.vue'
import setor from '../views/setor.vue'

const routes = [
{ path: '/', component: home },
{ path: '/login', component: login },
{ path: '/funcionario', component: funcionario },
{ path: '/estoque', component: estoque },
{ path: '/entrega', component: entrega },
{ path: '/cadastro', component: cadastro },
{ path: '/epi', component: epi },
{ path: '/dashboard', component: dashboard },
{ path: '/fornecedor', component: fornecedor },
{ path: '/setor', component: setor },


]
const router = createRouter({
history: createWebHistory(),
routes
})
export default router