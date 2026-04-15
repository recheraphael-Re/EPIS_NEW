<template>
  <main class="relatorio">

    <!-- HEADER -->
    <section class="relatorio__header">
      <h1>Relatórios</h1>
      <p>Visualize e gere relatórios de entregas de EPIs.</p>
    </section>

    <!-- FILTROS -->
    <section class="relatorio__filtros">

      <div class="filtro">
        <label>Data Inicial</label>
        <input type="date" v-model="filtro.dataInicio" />
      </div>

      <div class="filtro">
        <label>Data Final</label>
        <input type="date" v-model="filtro.dataFim" />
      </div>

      <div class="filtro">
        <label>Funcionário</label>
        <input
          type="text"
          placeholder="Digite o nome..."
          v-model="filtro.funcionario"
        />
      </div>

      <button class="btn btn--filtrar" @click="filtrar">
        Filtrar
      </button>

      <button class="btn btn--imprimir" @click="imprimir">
        Imprimir
      </button>

    </section>

    <!-- RESUMO -->
    <section class="relatorio__resumo">
      <div class="card">
        <h2>{{ entregasFiltradas.length }}</h2>
        <p>Total de Entregas</p>
      </div>
    </section>

    <!-- TABELA -->
    <section class="relatorio__tabela">
      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(e, index) in entregasFiltradas" :key="index">
            <td>{{ e.funcionario }}</td>
            <td>{{ e.epi }}</td>
            <td>{{ formatarData(e.data) }}</td>
          </tr>

          <tr v-if="entregasFiltradas.length === 0">
            <td colspan="3" class="vazio">
              Nenhum registro encontrado
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
const entregas = ref([
  { funcionario: "João", epi: "Capacete", data: "2026-04-01" },
  { funcionario: "Maria", epi: "Luva", data: "2026-04-05" },
  { funcionario: "Carlos", epi: "Bota", data: "2026-03-20" }
]);

const filtro = ref({
  dataInicio: "",
  dataFim: "",
  funcionario: ""
});

const entregasFiltradas = ref([...entregas.value]);

function filtrar() {
  entregasFiltradas.value = entregas.value.filter(e => {
    const data = new Date(e.data);

    const inicio = filtro.value.dataInicio
      ? new Date(filtro.value.dataInicio)
      : null;

    const fim = filtro.value.dataFim
      ? new Date(filtro.value.dataFim)
      : null;

    const matchData =
      (!inicio || data >= inicio) &&
      (!fim || data <= fim);

    const matchFuncionario = e.funcionario
      .toLowerCase()
      .includes(filtro.value.funcionario.toLowerCase());

    return matchData && matchFuncionario;
  });
}

function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}

function imprimir() {
  window.print();
}
</script>

<style scoped>
/* BASE */
.relatorio {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.relatorio__header h1 {
  color: #1f3a5f;
  margin-bottom: 0.3rem;
}

.relatorio__header p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* FILTROS */
.relatorio__filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filtro {
  display: flex;
  flex-direction: column;
}

.filtro label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  color: #1f3a5f;
}

.filtro input {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* BOTÕES */
.btn {
  align-self: flex-end;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.btn--filtrar {
  background-color: #ff8c00;
  color: white;
}

.btn--imprimir {
  background-color: #1f3a5f;
  color: white;
}

/* RESUMO */
.relatorio__resumo {
  margin-bottom: 1.5rem;
}

.card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  max-width: 200px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card h2 {
  color: #1f3a5f;
}

/* TABELA */
.relatorio__tabela {
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

.vazio {
  text-align: center;
  color: #999;
}
</style>