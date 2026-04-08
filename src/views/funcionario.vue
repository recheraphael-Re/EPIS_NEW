<template>
  <main class="funcionario">

    <!-- HEADER -->
    <section class="funcionario__header">
      <div>
        <h1>Funcionários</h1>
        <p>Gerencie os colaboradores cadastrados no sistema.</p>
      </div>

      <button class="btn btn--novo" @click="novoFuncionario">
        + Novo
      </button>
    </section>

    <!-- BUSCA -->
    <section class="funcionario__busca">
      <input
        type="text"
        placeholder="Buscar funcionário..."
        v-model="busca"
      />
    </section>

    <!-- TABELA -->
    <section class="funcionario__tabela">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cargo</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(f, index) in funcionariosFiltrados" :key="index">
            <td>{{ f.nome }}</td>
            <td>{{ f.email }}</td>
            <td>{{ f.cargo }}</td>
            <td>
              <button class="btn btn--editar" @click="editar(f)">Editar</button>
              <button class="btn btn--remover" @click="remover(index)">Excluir</button>
            </td>
          </tr>

          <tr v-if="funcionariosFiltrados.length === 0">
            <td colspan="4" class="vazio">
              Nenhum funcionário encontrado
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

const funcionarios = ref([
  { nome: "João Silva", email: "joao@email.com", cargo: "Operador" },
  { nome: "Maria Souza", email: "maria@email.com", cargo: "Técnica" },
  { nome: "Carlos Lima", email: "carlos@email.com", cargo: "Supervisor" }
]);

const funcionariosFiltrados = computed(() => {
  return funcionarios.value.filter(f =>
    f.nome.toLowerCase().includes(busca.value.toLowerCase())
  );
});

function novoFuncionario() {
  alert("Ir para tela de cadastro");
}

function editar(funcionario) {
  alert(`Editar: ${funcionario.nome}`);
}

function remover(index) {
  if (confirm("Deseja excluir este funcionário?")) {
    funcionarios.value.splice(index, 1);
  }
}
</script>

<style scoped>
/* BASE */
.funcionario {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.funcionario__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.funcionario__header h1 {
  color: #1f3a5f;
  margin-bottom: 0.3rem;
}

.funcionario__header p {
  color: #6c757d;
}

/* BUSCA */
.funcionario__busca {
  margin-bottom: 1rem;
}

.funcionario__busca input {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.funcionario__busca input:focus {
  outline: none;
  border-color: #ff8c00;
}

/* TABELA */
.funcionario__tabela {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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
  text-align: left;
}

tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.vazio {
  text-align: center;
  padding: 1rem;
  color: #999;
}

/* BOTÕES */
.btn {
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 0.3rem;
  font-size: 0.9rem;
}

/* NOVO */
.btn--novo {
  background-color: #ff8c00;
  color: white;
}

.btn--novo:hover {
  background-color: #e67e00;
}

/* EDITAR */
.btn--editar {
  background-color: #0d6efd;
  color: white;
}

/* REMOVER */
.btn--remover {
  background-color: #dc3545;
  color: white;
}
</style>