<template>
  <main class="epi">

    <!-- HEADER -->
    <section class="epi__header">
      <h1>Cadastro de EPIs</h1>
      <p>Gerencie os equipamentos de proteção individual.</p>
    </section>

    <!-- FORM -->
    <section class="epi__form">
      <form @submit.prevent="adicionarEPI">

        <div class="form__grupo">
          <label>Nome do EPI</label>
          <input
            type="text"
            v-model="novoEPI.nome"
            placeholder="Ex: Capacete"
            required
          />
        </div>

        <div class="form__grupo">
          <label>Quantidade</label>
          <input
            type="number"
            v-model="novoEPI.quantidade"
            min="1"
            required
          />
        </div>

        <div class="form__grupo">
          <label>Validade</label>
          <input
            type="date"
            v-model="novoEPI.validade"
            required
          />
        </div>

        <button type="submit" class="btn btn--salvar">
          Adicionar EPI
        </button>

      </form>
    </section>

    <!-- BUSCA -->
    <section class="epi__busca">
      <input
        type="text"
        placeholder="Buscar EPI..."
        v-model="busca"
      />
    </section>

    <!-- TABELA -->
    <section class="epi__tabela">
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
            v-for="(epi, index) in episFiltrados"
            :key="index"
            :class="{ vencido: isVencido(epi.validade) }"
          >
            <td>{{ epi.nome }}</td>
            <td>{{ epi.quantidade }}</td>
            <td>{{ formatarData(epi.validade) }}</td>
            <td>
              <span v-if="isVencido(epi.validade)" class="status status--vencido">
                Vencido
              </span>
              <span v-else class="status status--ok">
                OK
              </span>
            </td>
            <td>
              <button class="btn btn--remover" @click="remover(index)">
                Excluir
              </button>
            </td>
          </tr>

          <tr v-if="episFiltrados.length === 0">
            <td colspan="5" class="vazio">
              Nenhum EPI encontrado
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

const epis = ref([
  { nome: "Capacete", quantidade: 20, validade: "2026-12-10" },
  { nome: "Luva", quantidade: 50, validade: "2024-05-01" }
]);

const novoEPI = ref({
  nome: "",
  quantidade: 1,
  validade: ""
});

const episFiltrados = computed(() => {
  return epis.value.filter(e =>
    e.nome.toLowerCase().includes(busca.value.toLowerCase())
  );
});

function adicionarEPI() {
  if (!novoEPI.value.nome || !novoEPI.value.validade) {
    alert("Preencha todos os campos!");
    return;
  }

  epis.value.push({ ...novoEPI.value });

  novoEPI.value = {
    nome: "",
    quantidade: 1,
    validade: ""
  };
}

function remover(index) {
  if (confirm("Deseja excluir este EPI?")) {
    epis.value.splice(index, 1);
  }
}

function isVencido(data) {
  return new Date(data) < new Date();
}

function formatarData(data) {
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR");
}
</script>

<style scoped>
/* BASE */
.epi {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.epi__header h1 {
  color: #1f3a5f;
  margin-bottom: 0.3rem;
}

.epi__header p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* FORM */
.epi__form {
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
.epi__busca {
  margin-bottom: 1rem;
}

.epi__busca input {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* TABELA */
.epi__tabela {
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

/* VENCIDO */
.vencido {
  background-color: #ffe5e5 !important;
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