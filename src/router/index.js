import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Sobre from '/./views/sobre.vue'
import Contato from '../views/contato.vue'
import Produtos from '/./views/produtos.vue'
const routes = [
{ path: '/', component: Home },
{ path: '/ sobre', component: Sobre },
{ path: '/contato', component: Contato },
{ path: '/produtos', component: Produtos }
]
const router = createRouter({
history: createWebHistory(),
routes
})
export default router