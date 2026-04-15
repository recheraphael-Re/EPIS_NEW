<template>
  <main class="login">

    <section class="login__card">

      <!-- TÍTULO -->
      <div class="login__header">
        <h1>Login</h1>
        <p>Acesse o sistema de gestão de EPI</p>
      </div>

      <!-- FORM -->
      <form @submit.prevent="entrar">

        <div class="form__grupo">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            placeholder="Digite seu email"
            required
          />
        </div>

        <div class="form__grupo">
          <label for="senha">Senha</label>
          <input
            type="password"
            id="senha"
            v-model="senha"
            placeholder="Digite sua senha"
            required
          />
        </div>

        <!-- BOTÃO -->
        <button type="submit" class="btn btn--login">
          Entrar
        </button>

      </form>

    </section>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import { useRouter } from 'vue-router'

const { supabase } = useSupabase()
const router = useRouter()

const email = ref(" ")
const senha = ref(" ")

async function entrar() {
  if (!email.value || !senha.value) {
    alert("Preencha todos os campos!")
    return
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: senha.value,
  })

  if (error) {
    alert("Erro: " + error.message)
    return
  }

  alert("Login realizado com sucesso!")

  router.push('/applayout') //redireciona após login
}
</script>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1f3a5f;
}

.login__card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.login__header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.login__header h1 {
  color: #1f3a5f;
}

.login__header p {
  color: #6c757d;
  font-size: 0.9rem;
}

.form__grupo {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form__grupo label {
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #1f3a5f;
}

.form__grupo input {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.form__grupo input:focus {
  outline: none;
  border-color: #ff8c00;
}

.btn {
  width: 100%;
  padding: 0.7rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

.btn--login {
  background-color: #ff8c00;
  color: white;
  margin-top: 0.5rem;
}

.btn--login:hover {
  background-color: #e67e00;
}
</style>