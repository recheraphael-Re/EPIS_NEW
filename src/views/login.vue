<template>
  <div class="login-page">
    <div class="login-brand">
      <i class="fas fa-shield-alt"></i>
      <h1>SafeEPI</h1>
      <p>Sistema de Gestão de Equipamentos<br>de Proteção Individual</p>
    </div>

    <div class="login-card">
      <div class="card-top">
        <h2>Bem-vindo de volta</h2>
        <p>Entre com suas credenciais para acessar o sistema</p>
      </div>

      <form @submit.prevent="entrar">
        <div class="field">
          <label>E-mail</label>
          <div class="input-icon">
            <i class="fas fa-envelope"></i>
            <input
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="field">
          <label>Senha</label>
          <div class="input-icon">
            <i class="fas fa-lock"></i>
            <input
              v-model="senha"
              type="password"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div v-if="erro" class="alert alert-error">
          <i class="fas fa-exclamation-circle"></i> {{ erro }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-sign-in-alt"></i>
          {{ loading ? 'Entrando...' : 'Acessar Sistema' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const { supabase } = useSupabase()
const router = useRouter()

const email = ref('')
const senha = ref('')
const loading = ref(false)
const erro = ref('')

async function entrar() {
  loading.value = true
  erro.value = ''
  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: senha.value,
  })
  loading.value = false
  if (error) {
    erro.value = 'E-mail ou senha inválidos. Verifique e tente novamente.'
    return
  }
  router.push('/applayout/dashboard')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1a3a6b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5rem;
  padding: 2rem;
}

.login-brand {
  text-align: center;
  color: #fff;
}

.login-brand i {
  font-size: 4rem;
  color: #f97316;
  display: block;
  margin-bottom: 1rem;
}

.login-brand h1 {
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 0.75rem;
}

.login-brand p { color: #94a3b8; font-size: 1rem; line-height: 1.6; }

.login-card {
  background: #fff;
  border-radius: 20px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 25px 60px rgba(0,0,0,0.35);
}

.card-top { margin-bottom: 1.75rem; }
.card-top h2 { font-size: 1.4rem; font-weight: 700; color: #0f172a; margin-bottom: 0.3rem; }
.card-top p { color: #64748b; font-size: 0.875rem; }

.field { margin-bottom: 1.1rem; }

.field label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.4rem;
}

.input-icon { position: relative; }

.input-icon i {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.875rem;
}

.input-icon input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: #fff;
}

.input-icon input:focus {
  outline: none;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}

.input-icon input:disabled { background: #f8fafc; opacity: 0.7; }

.btn-login {
  width: 100%;
  padding: 0.85rem;
  background: #f97316;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background 0.15s, transform 0.1s;
  margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) { background: #ea6e0a; }
.btn-login:active:not(:disabled) { transform: scale(0.99); }
.btn-login:disabled { opacity: 0.65; cursor: not-allowed; }

@media (max-width: 720px) {
  .login-page { flex-direction: column; gap: 2rem; }
  .login-brand { display: none; }
}
</style>
