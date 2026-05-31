<template>
  <div class="shell">
    <!-- Botão hambúrguer (só aparece no mobile) -->
    <button class="hamburger" @click="menuAberto = true" aria-label="Abrir menu">
      <i class="fas fa-bars"></i>
    </button>

    <!-- Fundo escurecido ao abrir o menu no mobile -->
    <div
      v-if="menuAberto"
      class="overlay"
      @click="menuAberto = false"
    ></div>

    <aside class="sidebar" :class="{ aberto: menuAberto }">
      <div class="brand">
        <i class="fas fa-shield-alt"></i>
        <span>SafeEPI</span>
        <button class="fechar" @click="menuAberto = false" aria-label="Fechar menu">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <nav class="nav" @click="menuAberto = false">
        <RouterLink v-if="isAdmin" to="/applayout/epi" class="nav-item" active-class="active">
          <i class="fas fa-hard-hat"></i>
          <span>Cadastro EPI</span>
        </RouterLink>
        <RouterLink v-if="isAdmin" to="/applayout/funcionario" class="nav-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>Funcionários</span>
        </RouterLink>
        <RouterLink v-if="isAdmin" to="/applayout/setor" class="nav-item" active-class="active">
          <i class="fas fa-sitemap"></i>
          <span>Setores</span>
        </RouterLink>
        <RouterLink v-if="isAdmin" to="/applayout/estoque" class="nav-item" active-class="active">
          <i class="fas fa-boxes"></i>
          <span>Estoque</span>
        </RouterLink>
        <RouterLink to="/applayout/entrega" class="nav-item" active-class="active">
          <i class="fas fa-box-open"></i>
          <span>Entregas</span>
        </RouterLink>
        <RouterLink to="/applayout/devolucao" class="nav-item" active-class="active">
          <i class="fas fa-undo"></i>
          <span>Devoluções</span>
        </RouterLink>
        <RouterLink to="/applayout/posse" class="nav-item" active-class="active">
          <i class="fas fa-people-carry"></i>
          <span>EPIs em Posse</span>
        </RouterLink>
        <RouterLink to="/applayout/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-chart-pie"></i>
          <span>Dashboard</span>
        </RouterLink>
        <RouterLink to="/applayout/relatorio" class="nav-item" active-class="active">
          <i class="fas fa-file-alt"></i>
          <span>Relatórios</span>
        </RouterLink>
        <button type="button" class="nav-item nav-item-btn" @click="baixarPdfComercial">
          <i class="fas fa-file-pdf"></i>
          <span>PDF Comercial</span>
        </button>
      </nav>

      <button @click="sair" class="btn-sair">
        <i class="fas fa-sign-out-alt"></i>
        <span>Sair</span>
      </button>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'
import { gerarPdfComercial } from '../utils/pdfComercial'

const { supabase, isAdmin } = useSupabase()
const router = useRouter()

const menuAberto = ref(false)

async function sair() {
  await supabase.auth.signOut()
  router.push('/login')
}

async function baixarPdfComercial() {
  menuAberto.value = false
  await gerarPdfComercial()
}
</script>

<style scoped>
.shell {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background: #0f172a;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding-bottom: 1.5rem;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
  z-index: 100;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1.4rem 1.25rem;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 0.5rem;
}

.brand i { color: #f97316; font-size: 1.25rem; }

/* Botão de fechar dentro da sidebar — só no mobile */
.fechar {
  margin-left: auto;
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
  display: none;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0.75rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 0.65rem 1rem;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
}

.nav-item i { width: 18px; text-align: center; font-size: 0.9rem; flex-shrink: 0; }

.nav-item:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }

.nav-item.active {
  background: rgba(249,115,22,0.13);
  color: #fb923c;
  font-weight: 600;
}

.nav-item.active i { color: #fb923c; }

/* Botão dentro do menu (PDF Comercial) — herda o visual de .nav-item */
.nav-item-btn {
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
}

.btn-sair {
  margin: 0.5rem 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.65rem 1rem;
  background: rgba(239,68,68,0.1);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.2);
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: inherit;
  transition: background 0.15s;
  width: calc(100% - 1.5rem);
}

.btn-sair:hover { background: rgba(239,68,68,0.2); color: #fecaca; }

.content {
  flex: 1;
  margin-left: 240px;
  overflow-y: auto;
  min-height: 100vh;
  background: #f1f5f9;
}

/* Hambúrguer e overlay ficam escondidos no desktop */
.hamburger {
  display: none;
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 90;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 8px;
  background: #0f172a;
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
}

.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 99;
}

/* ===== Tablet / Mobile ===== */
@media (max-width: 768px) {
  .hamburger { display: flex; align-items: center; justify-content: center; }
  .overlay { display: block; }
  .fechar { display: block; }

  /* Sidebar vira gaveta deslizante, escondida por padrão */
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    box-shadow: 2px 0 12px rgba(0,0,0,0.3);
  }
  .sidebar.aberto { transform: translateX(0); }

  /* Conteúdo ocupa toda a largura */
  .content {
    margin-left: 0;
    /* espaço para não ficar embaixo do botão hambúrguer */
    padding-top: 3.5rem;
  }
}
</style>
