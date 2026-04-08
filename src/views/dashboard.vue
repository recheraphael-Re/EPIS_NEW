<template>
  <main class="dashboard">

    <!-- HEADER -->
    <section class="dashboard__header">
      <h1>Dashboard</h1>
      <p>Visão geral do sistema de gestão de EPIs</p>
    </section>

    <!-- CARDS -->
    <section class="dashboard__cards">

      <div class="card">
        <h2>{{ totalFuncionarios }}</h2>
        <p>Funcionários</p>
      </div>

      <div class="card">
        <h2>{{ totalEPIs }}</h2>
        <p>EPIs em estoque</p>
      </div>

      <div class="card alerta">
        <h2>{{ episVencidos }}</h2>
        <p>EPIs vencidos</p>
      </div>

      <div class="card destaque">
        <h2>{{ totalEntregas }}</h2>
        <p>Entregas realizadas</p>
      </div>

    </section>

    <!-- ENTREGAS RECENTES -->
    <section class="dashboard__tabela">
      <h2>Últimas Entregas</h2>

      <table>
        <thead>
          <tr>
            <th>Funcionário</th>
            <th>EPI</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(e, index) in entregasRecentes" :key="index">
            <td>{{ e.funcionario }}</td>
            <td>{{ e.epi }}</td>
            <td>{{ formatarData(e.data) }}</td>
          </tr>

          <tr v-if="entregasRecentes.length === 0">
            <td colspan="3" class="vazio">Nenhuma entrega recente</td>
          </tr>
        </tbody>
      </table>

    </section>

  </main>
</template>

<script setup>
import { ref, computed } from "vue";

/* DADOS MOCKADOS (depois você pode integrar tudo) */
const funcionarios = ref([
  { nome: "João" },
  { nome: "Maria" },
  { nome: "Carlos" }
]);

const epis = ref([
  { nome: "Capacete", validade: "2026-12-10" },
  { nome: "Luva", validade: "2024-05-01" },
  { nome: "Bota", validade: "2025-01-15" }
]);

const entregas = ref([
  { funcionario: "João", epi: "Capacete", data: "2026-04-01" },
  { funcionario: "Maria", epi: "Luva", data: "2026-04-03" }
]);

/* MÉTRICAS */
const totalFuncionarios = computed(() => funcionarios.value.length);
const totalEPIs = computed(() => epis.value.length);

function isVencido(data) {
  return new Date(data) < new Date();
}

const episVencidos = computed(() =>
  epis.value.filter(e => isVencido(e.validade)).length
);

const totalEntregas = computed(() => entregas.value.length);

const entregasRecentes = computed(() =>
  entregas.value.slice(-5).reverse()
);

/* FUNÇÕES */
function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}
</script>

<style scoped>
/* BASE */
.dashboard {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.dashboard__header h1 {
  color: #1f3a5f;
  margin-bottom: 0.3rem;
}

.dashboard__header p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* CARDS */
.dashboard__cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 180px;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card h2 {
  color: #1f3a5f;
  font-size: 2rem;
}

.card p {
  color: #6c757d;
}

/* ALERTA */
.card.alerta {
  border: 2px solid #ff8c00;
}

/* DESTAQUE */
.card.destaque {
  background-color: #1f3a5f;
  color: white;
}

.card.destaque h2 {
  color: white;
}

.card.destaque p {
  color: #ddd;
}

/* TABELA */
.dashboard__tabela {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.dashboard__tabela h2 {
  margin-bottom: 1rem;
  color: #1f3a5f;
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