<template>
  <main class="entrega">

    <!-- HEADER -->
    <section class="entrega__header">
      <h1>Entrega de EPIs</h1>
      <p>Registre e acompanhe as entregas realizadas aos colaboradores.</p>
    </section>

    <!-- FORMULÁRIO -->
    <section class="entrega__form">
      <form @submit.prevent="registrarEntrega">

        <div class="form__grupo">
          <label>Funcionário</label>
          <select v-model="novaEntrega.funcionario" required>
            <option disabled value="">Selecione</option>
            <option v-for="f in funcionarios" :key="f">{{ f }}</option>
          </select>
        </div>

        <div class="form__grupo">
          <label>EPI</label>
          <select v-model="novaEntrega.epi" required>
            <option disabled value="">Selecione</option>
            <option v-for="e in epis" :key="e">{{ e }}</option>
          </select>
        </div>

        <div class="form__grupo">
          <label>Data</label>
          <input type="date" v-model="novaEntrega.data" required />
        </div>

        <button type="submit" class="btn btn--salvar">
          Registrar Entrega
        </button>

      </form>
    </section>

    <!-- LISTA -->
    <section class="entrega__tabela">
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(entrega, index) in entregas" :key="index">
            <td>{{ entrega.funcionario }}</td>
            <td>{{ entrega.epi }}</td>
            <td>{{ formatarData(entrega.data) }}</td>
            <td>
              <button class="btn btn--remover" @click="remover(index)">
                Excluir
              </button>
            </td>
          </tr>

          <tr v-if="entregas.length === 0">
            <td colspan="4" class="vazio">
              Nenhuma entrega registrada
            </td>
          </tr>
        </tbody>
      </table>
    </section>

  </main>
</template>

<script setup>
import { ref } from "vue";

/* DADOS MOCKADOS */
const funcionarios = ref(["João Silva", "Maria Souza", "Carlos Lima"]);
const epis = ref(["Capacete", "Luva", "Bota"]);

const entregas = ref([]);

const novaEntrega = ref({
  funcionario: "",
  epi: "",
  data: ""
});

/* FUNÇÕES */
function registrarEntrega() {
  if (!novaEntrega.value.funcionario || !novaEntrega.value.epi || !novaEntrega.value.data) {
    alert("Preencha todos os campos!");
    return;
  }

  entregas.value.push({ ...novaEntrega.value });

  alert("Entrega registrada com sucesso!");

  novaEntrega.value = {
    funcionario: "",
    epi: "",
    data: ""
  };
}

function remover(index) {
  if (confirm("Deseja excluir esta entrega?")) {
    entregas.value.splice(index, 1);
  }
}

function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}
</script>

<style scoped>
/* BASE */
.entrega {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.entrega__header h1 {
  color: #1f3a5f;
  margin-bottom: 0.3rem;
}

.entrega__header p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* FORM */
.entrega__form {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 500px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.form__grupo {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form__grupo label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #1f3a5f;
}

.form__grupo input,
.form__grupo select {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.form__grupo input:focus,
.form__grupo select:focus {
  outline: none;
  border-color: #ff8c00;
}

/* BOTÃO */
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.btn--salvar {
  background-color: #ff8c00;
  color: white;
}

.btn--salvar:hover {
  background-color: #e67e00;
}

/* TABELA */
.entrega__tabela {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #1f3a5f;
  color: white;
}

th, td {
  padding: 0.8rem;
}

tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* BOTÃO REMOVER */
.btn--remover {
  background-color: #dc3545;
  color: white;
}

/* VAZIO */
.vazio {
  text-align: center;
  color: #999;
}
</style>