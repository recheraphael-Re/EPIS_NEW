<template>
  <main class="fornecedor">

    <!-- HEADER -->
    <section class="fornecedor__header">
      <h1>Fornecedores</h1>
      <p>Gerencie os fornecedores de EPIs.</p>
    </section>

    <!-- FORM -->
    <section class="fornecedor__form">
      <form @submit.prevent="adicionarFornecedor">

        <div class="form__grupo">
          <label>Nome</label>
          <input
            type="text"
            v-model="novoFornecedor.nome"
            placeholder="Ex: Empresa XYZ"
            required
          />
        </div>

        
        <div class="form__grupo">
          <label>CNPJ</label>
          <input
            type="text"
            v-model="novoFornecedor.cnpj"
            placeholder="00.000.000/0001-00"
          />
        </div>

        <div class="form__grupo">
          <label>Contato</label>
          <input
            type="text"
            v-model="novoFornecedor.contato"
            placeholder="Ex: João Silva"
          />
        </div>

        <div class="form__grupo">
          <label>E-mail</label>
          <input
            type="text"
            v-model="novoFornecedor.email"
            placeholder="exemplo@dominio.com"
          />
        </div>

        <div class="form__grupo">
          <label>Telefone</label>
          <input
            type="text"
            v-model="novoFornecedor.telefone"
            placeholder="(11) 99999-9999"
          />
        </div>

        <button type="submit" class="btn btn--salvar">
          Adicionar Fornecedor
        </button>

      </form>
    </section>

    <!-- BUSCA -->
    <section class="fornecedor__busca">
      <input
        type="text"
        placeholder="Buscar fornecedor..."
        v-model="busca"
      />
    </section>

    <!-- TABELA -->
    <section class="fornecedor__tabela">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNPJ</th>
            <th>Telefone</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(f, index) in fornecedoresFiltrados" :key="index">
            <td>{{ f.nome }}</td>
            <td>{{ f.cnpj }}</td>
            <td>{{ f.telefone }}</td>
            <td>
              <button class="btn btn--remover" @click="excluir(f.id)">
                Excluir
              </button>
            </td>
          </tr>

          <tr v-if="fornecedoresFiltrados.length === 0">
            <td colspan="4" class="vazio">
              Nenhum fornecedor encontrado
            </td>
          </tr>
        </tbody>
      </table>
    </section>

  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSupabase } from '../composables/useSupabase';

const { supabase } = useSupabase();

const busca = ref("");
const fornecedores = ref([]);
const editanoId = ref(null);
const form = reactive({
  nome: "",
  cnpj: "",
  contato: "",
  email: "",  
  telefone: ""
});

const carregar = async () => {
  const { data, error } = await supabase.from('fornecedores').select('*').order('nome');
  if (error) {
    console.error("Erro ao carregar:", error.message);
  } else {
    fornecedores.value = data || [];

  }
};

const salvar = async () => {
  if (editanoId.value) {
     // Modo de Edição (Update)
      await supabase.from('fornecedores').update(form).eq('id', editandoId.value);
    } else {
      // Modo de Criação (Insert)
      await supabase.from('fornecedores').insert([form]); 
  }
  cancelarEdicao();
  carregar();

};

// Prepara o formulário para edição ao clicar no botão
  const prepararEdicao = (f) => {
    editanoId.value = f.id;
    Object.assign(form, { 
      nome: f.nome, 
      cnpj: f.cnpj, 
      contato: f.contato, 
      email: f.email, 
      telefone: f.telefone
    });
  };

  // Deleta um registro
  const excluir = async (id) => {
    await supabase.from('fornecedores').delete().eq('id', id);
    carregar();
  };

 // Limpa o formulário e sai do modo de edição
const cancelarEdicao = () => {
  editanoId.value = null;
  Object.assign(form, {  
    nome: "",
    cnpj: "",
    telefone: "",
    contato: "",
    email: "" 
  });
}
// Inicia a busca de dados assim que a tela abre
onMounted(carregar);
</script>

<style scoped>
/* BASE */
.fornecedor {
  padding: 2rem;
  background-color: #f5f6f8;
  min-height: 100vh;
}

/* HEADER */
.fornecedor__header h1 {
  color: #1f3a5f;
  margin-bottom: 0.3rem;
}

.fornecedor__header p {
  color: #6c757d;
  margin-bottom: 1.5rem;
}

/* FORM */
.fornecedor__form {
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
.fornecedor__busca {
  margin-bottom: 1rem;
}

.fornecedor__busca input {
  width: 100%;
  max-width: 300px;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

/* TABELA */
.fornecedor__tabela {
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