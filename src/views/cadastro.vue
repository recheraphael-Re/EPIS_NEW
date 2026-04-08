<template>
  <main class="cadastro">
    <!-- TÍTULO -->
    <section class="cadastro__header">
      <h1>Cadastro</h1>
      <p>Preencha os dados para realizar um novo cadastro no sistema.</p>
    </section>

    <!-- FORMULÁRIO -->
    <section class="cadastro__form">
      <form @submit.prevent="salvar">

        <div class="form__grupo">
          <label for="nome">Nome</label>
          <input type="text" id="nome" v-model="form.nome" required />
        </div>

        <div class="form__grupo">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" />
        </div>

        <div class="form__grupo">
          <label for="cargo">Cargo</label>
          <input type="text" id="cargo" v-model="form.cargo" />
        </div>

        <div class="form__grupo">
          <label for="tipo">Tipo</label>
          <select v-model="form.tipo">
            <option value="colaborador">Colaborador</option>
            <option value="epi">EPI</option>
          </select>
        </div>

        <div class="form__grupo">
          <label for="descricao">Descrição</label>
          <textarea id="descricao" v-model="form.descricao"></textarea>
        </div>

        <!-- BOTÕES -->
        <div class="form__acoes">
          <button type="submit" class="btn btn--salvar">Salvar</button>
          <button type="button" class="btn btn--cancelar" @click="limpar">
            Cancelar
          </button>
        </div>

      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive } from "vue";

const form = reactive({
  nome: "",
  email: "",
  cargo: "",
  tipo: "colaborador",
  descricao: ""
});

function salvar() {
  console.log("Dados salvos:", form);
  alert("Cadastro realizado com sucesso!");

  limpar();
}

function limpar() {
  form.nome = "";
  form.email = "";
  form.cargo = "";
  form.tipo = "colaborador";
  form.descricao = "";
}
</script>

<style scoped>
/* BASE */
.cadastro {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.cadastro__header h1 {
  color: #1f3a5f;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.cadastro__header p {
  color: #6c757d;
  margin-bottom: 2rem;
}

/* FORM */
.cadastro__form {
  background: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* CAMPOS */
.form__grupo {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.2rem;
}

.form__grupo label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #1f3a5f;
}

.form__grupo input,
.form__grupo select,
.form__grupo textarea {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: 0.2s;
}

.form__grupo input:focus,
.form__grupo select:focus,
.form__grupo textarea:focus {
  outline: none;
  border-color: #ff8c00;
}

/* BOTÕES */
.form__acoes {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  padding: 0.6rem 1.4rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

/* LARANJA (igual seu botão entrar) */
.btn--salvar {
  background-color: #ff8c00;
  color: white;
}

.btn--salvar:hover {
  background-color: #e67e00;
}

/* CINZA */
.btn--cancelar {
  background-color: #dee2e6;
}

.btn--cancelar:hover {
  background-color: #ced4da;
}
</style>