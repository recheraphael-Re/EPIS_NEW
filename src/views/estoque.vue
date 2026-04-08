<template>
  <main class="estoque">

    <!-- HEADER -->
    <section class="estoque__header">
      <div>
        <h1>Estoque de EPIs</h1>
        <p>Controle e acompanhe os equipamentos disponíveis.</p>
      </div>

      <button class="btn btn--novo" @click="novoItem">
        + Novo EPI
      </button>
    </section>

    <!-- BUSCA -->
    <section class="estoque__busca">
      <input
        type="text"
        placeholder="Buscar EPI..."
        v-model="busca"
      />
    </section>

    <!-- CARDS RESUMO -->
    <section class="estoque__cards">
      <div class="card">
        <h2>{{ totalEPIs }}</h2>
        <p>Total de EPIs</p>
      </div>

      <div class="card">
        <h2>{{ totalDisponivel }}</h2>
        <p>Disponíveis</p>
      </div>

      <div class="card alerta">
        <h2>{{ totalVencidos }}</h2>
        <p>Vencidos</p>
      </div>
    </section>

    <!-- TABELA -->
    <section class="estoque__tabela">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Quantidade</th>
            <th>Validade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in itensFiltrados"
            :key="index"
            :class="{ vencido: isVencido(item.validade) }"
          >
            <td>{{ item.nome }}</td>
            <td>{{ item.quantidade }}</td>
            <td>{{ formatarData(item.validade) }}</td>
            <td>
              <span v-if="isVencido(item.validade)" class="status status--vencido">
                Vencido
              </span>
              <span v-else class="status status--ok">
                OK
              </span>
            </td>
            <td>
              <button class="btn btn--editar" @click="editar(item)">Editar</button>
              <button class="btn btn--remover" @click="remover(index)">Excluir</button>
            </td>
          </tr>

          <tr v-if="itensFiltrados.length === 0">
            <td colspan="5" class="vazio">
              Nenhum item encontrado
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

const itens = ref([
  { nome: "Capacete", quantidade: 20, validade: "2026-12-10" },
  { nome: "Luva", quantidade: 50, validade: "2024-05-01" },
  { nome: "Bota", quantidade: 15, validade: "2025-01-15" }
]);

const itensFiltrados = computed(() => {
  return itens.value.filter(item =>
    item.nome.toLowerCase().includes(busca.value.toLowerCase())
  );
});

const totalEPIs = computed(() => itens.value.length);

const totalDisponivel = computed(() =>
  itens.value.filter(item => !isVencido(item.validade)).length
);

const totalVencidos = computed(() =>
  itens.value.filter(item => isVencido(item.validade)).length
);

function isVencido(data) {
  return new Date(data) < new Date();
}

function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}

function novoItem() {
  alert("Ir para cadastro de EPI");
}

function editar(item) {
  alert(`Editar: ${item.nome}`);
}

function remover(index) {
  if (confirm("Deseja excluir este item?")) {
    itens.value.splice(index, 1);
  }
}
</script>

<style scoped>
/* BASE */
.estoque {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.estoque__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.estoque__header h1 {
  color: #1f3a5f;
}

.estoque__header p {
  color: #6c757d;
}

/* BUSCA */
.estoque__busca {
  margin-bottom: 1rem;
}

.estoque__busca input {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.estoque__busca input:focus {
  outline: none;
  border-color: #ff8c00;
}

/* CARDS */
.estoque__cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.card {
  flex: 1;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card h2 {
  color: #1f3a5f;
}

.card.alerta {
  border: 2px solid #ff8c00;
}

/* TABELA */
.estoque__tabela {
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

.vencido {
  background-color: #ffe5e5 !important;
}

/* STATUS */
.status {
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: bold;
}

.status--ok {
  background-color: #d4edda;
  color: #155724;
}

.status--vencido {
  background-color: #f8d7da;
  color: #721c24;
}

/* BOTÕES */
.btn {
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 0.3rem;
}

.btn--novo {
  background-color: #ff8c00;
  color: white;
}

.btn--editar {
  background-color: #0d6efd;
  color: white;
}

.btn--remover {
  background-color: #dc3545;
  color: white;
}

.vazio {
  text-align: center;
  color: #999;
}
</style>