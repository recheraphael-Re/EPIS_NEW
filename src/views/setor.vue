<template>
  <main class="setor">

    <!-- HEADER -->
    <section class="setor__header">
      <h1>Setores</h1>
      <p>Gerencie os setores da empresa.</p>
    </section>

    <!-- FORM -->
    <section class="setor__form">
      <form @submit.prevent="adicionarSetor">

        <div class="form__grupo">
          <label>Nome do Setor</label>
          <input
            type="text"
            v-model="novoSetor.nome"
            placeholder="Ex: Produção"
            required
          />
        </div>

        <div class="form__grupo">
          <label>Descrição</label>
          <input
            type="text"
            v-model="novoSetor.descricao"
            placeholder="Ex: Linha de montagem"
          />
        </div>

        <button class="btn btn--salvar" type="submit">
          Adicionar Setor
        </button>

      </form>
    </section>

    <!-- BUSCA -->
    <section class="setor__busca">
      <input
        type="text"
        placeholder="Buscar setor..."
        v-model="busca"
      />
    </section>

    <!-- LISTA -->
    <section class="setor__tabela">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(s, index) in setoresFiltrados" :key="index">
            <td>{{ s.nome }}</td>
            <td>{{ s.descricao }}</td>
            <td>
              <button class="btn btn--remover" @click="remover(index)">
                Excluir
              </button>
            </td>
          </tr>

          <tr v-if="setoresFiltrados.length === 0">
            <td colspan="3" class="vazio">
              Nenhum setor encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </section>

  </main>
</template>

<script setup>
import { ref, computed } from "vue";

const busca = ref("");

const setores = ref([
  { nome: "Produção", descricao: "Linha de montagem" },
  { nome: "Segurança", descricao: "Controle de EPIs" },
  { nome: "Administrativo", descricao: "Gestão geral" }
]);

const novoSetor = ref({
  nome: "",
  descricao: ""
});

const setoresFiltrados = computed(() => {
  return setores.value.filter(s =>
    s.nome.toLowerCase().includes(busca.value.toLowerCase())
  );
});

function adicionarSetor() {
  if (!novoSetor.value.nome) {
    alert("Digite o nome do setor!");
    return;
  }

  setores.value.push({ ...novoSetor.value });

  novoSetor.value = {
    nome: "",
    descricao: ""
  };
}

function remover(index) {
  if (confirm("Deseja excluir este setor?")) {
    setores.value.splice(index, 1);
  }
}
</script>

<style scoped>
/* BASE */
.setor {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.setor__header h1 {
  color: #1f3a5f;
  margin-bottom: 0.3rem;
}

.setor__header p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* FORM */
.setor__form {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 500px;
  margin-bottom: 1.5rem;
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

.form__grupo input {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.form__grupo input:focus {
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

/* BUSCA */
.setor__busca {
  margin-bottom: 1rem;
}

.setor__busca input {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* TABELA */
.setor__tabela {
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