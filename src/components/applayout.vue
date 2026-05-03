<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <i class="fas fa-shield-alt"></i>
        <span>SafeEPI</span>
      </div>

      <nav class="nav">
        <RouterLink to="/applayout/dashboard" class="nav-item" active-class="active">
          <i class="fas fa-chart-pie"></i>
          <span>Dashboard</span>
        </RouterLink>
        <RouterLink to="/applayout/funcionario" class="nav-item" active-class="active">
          <i class="fas fa-users"></i>
          <span>Funcionários</span>
        </RouterLink>
        <RouterLink to="/applayout/epi" class="nav-item" active-class="active">
          <i class="fas fa-hard-hat"></i>
          <span>Cadastro EPI</span>
        </RouterLink>
        <RouterLink to="/applayout/estoque" class="nav-item" active-class="active">
          <i class="fas fa-boxes"></i>
          <span>Estoque</span>
        </RouterLink>
        <RouterLink to="/applayout/entrega" class="nav-item" active-class="active">
          <i class="fas fa-box-open"></i>
          <span>Entregas</span>
        </RouterLink>
        <RouterLink to="/applayout/setor" class="nav-item" active-class="active">
          <i class="fas fa-sitemap"></i>
          <span>Setores</span>
        </RouterLink>
        <RouterLink to="/applayout/relatorio" class="nav-item" active-class="active">
          <i class="fas fa-file-alt"></i>
          <span>Relatórios</span>
        </RouterLink>
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
import { RouterLink, RouterView } from 'vue-router'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const { supabase } = useSupabase()
const router = useRouter()

async function sair() {
  await supabase.auth.signOut()
  router.push('/login')
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
</style>
