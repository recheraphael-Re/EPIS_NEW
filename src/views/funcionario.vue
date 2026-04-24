<template>
  <div class="layout-container">
    
    <header class="header-section">
      <h1>Controle de Efetivo</h1>
      <p>Gerencie o cadastro de colaboradores e organize por setores.</p>
    </header>

    <main class="content">
      <section class="card-form">
        <div class="card-header">
          <h3>{{ editandoId ? 'Alterar Registro' : 'Novo Funcionário' }}</h3>
        </div>
        
        <form @submit.prevent="salvar" class="main-form">
          <div class="form-row">
            <div class="form-group">
              <label for="nome">Nome Completo</label>
              <input v-model="form.nome" type="text" id="nome" placeholder="Digite o nome completo" required>
            </div>
            <div class="form-group">
              <label for="matricula">Nº Matrícula</label>
              <input v-model="form.matricula" type="text" id="matricula" placeholder="Ex: sp554" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="setor">Setor</label>
              <input v-model="form.setor" type="text" id="setor" placeholder="Ex: Manutenção" required>
            </div>
            <div class="form-group">
              <label for="cargo">Cargo</label>
              <input v-model="form.cargo" type="text" id="cargo" placeholder="Ex: Pedreiro" required>
            </div>
          </div>
          
          <div class="action-bar">
            <button type="submit" class="btn btn-primary">
              {{ editandoId ? 'Atualizar Dados' : 'Finalizar Cadastro' }}
            </button>
            <button v-if="editandoId" type="button" @click="cancelarEdicao" class="btn btn-outline">
              Cancelar
            </button>
          </div>
        </form>
      </section>

      <section class="card-table">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Matrícula</th>
              <th>Setor / Cargo</th>
              <th class="text-center">Gerenciar</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in funcionarios" :key="f.id">
              <td><span class="text-bold">{{ f.nome }}</span></td>
              <td>{{ f.matricula }}</td>
              <td>
                <span class="badge">{{ f.setor }}</span>
                <span class="cargo-text">{{ f.cargo }}</span>
              </td>
              <td class="text-center">
                <button @click="prepararEdicao(f)" class="btn-action edit">Editar</button>
                <button @click="excluir(f.id)" class="btn-action delete">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useSupabase } from '../composables/useSupabase';

const { supabase } = useSupabase();


// Variáveis que controlam os dados na tela
const funcionarios = ref([]);
const editandoId = ref(null);
const form = reactive({ 
  nome: '', 
  matricula: '', 
  setor: '', 
  cargo: '' 
});

const carregar = async () => {
  const { data, error } = await supabase.from('funcionarios').select('*').order('nome');
  if (error) {
    console.error("Erro ao carregar:", error.message);
  } else {
    funcionarios.value = data || [];
  }
};

// Salva um novo ou atualiza um existente
const salvar = async () => {
  if (editandoId.value) {
    // Modo de Edição (Update)
    await supabase.from('funcionarios').update(form).eq('id', editandoId.value);
  } else {
    // Modo de Criação (Insert)
    await supabase.from('funcionarios').insert([form]);
  }
  cancelarEdicao();
  carregar();
};

// Prepara o formulário para edição ao clicar no botão
const prepararEdicao = (f) => {
  editandoId.value = f.id;
  Object.assign(form, { 
    nome: f.nome, 
    matricula: f.matricula, 
    setor: f.setor, 
    cargo: f.cargo 
  });
};

// Deleta um registro
const excluir = async (id) => {
  if (confirm('Deseja realmente remover este registro?')) {
    await supabase.from('funcionarios').delete().eq('id', id);
    carregar();
  }
};

// Limpa o formulário e sai do modo de edição
const cancelarEdicao = () => {
  editandoId.value = null;
  Object.assign(form, { nome: '', matricula: '', setor: '', cargo: '' });
};

// Inicia a busca de dados assim que a tela abre
onMounted(carregar);
</script>

<style scoped>
 
.layout-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 40px 20px;
  background-color: #f8fafc;
  min-height: 100vh;
}

.header-section { margin-bottom: 30px; }
.header-section h1 { color: #0f172a; font-size: 1.8rem; }
.header-section p { color: #64748b; }

/* Cards */
.card-form, .card-table {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  overflow: hidden;
}

.card-header {
  background-color: #f8fafc;
  padding: 15px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.main-form { padding: 24px; }

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }

label { font-size: 0.85rem; font-weight: 700; color: #475569; }

input {
  padding: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
}

input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

/* BotÃµes Estilizados */
.action-bar { display: flex; gap: 12px; }
.btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-primary { background: #2563eb; color: white; border: none; }
.btn-outline { background: white; color: #64748b; border: 1px solid #cbd5e1; }

/* Tabela Profissional */
.styled-table { width: 100%; border-collapse: collapse; }
.styled-table th {
  background-color: #f1f5f9;
  padding: 16px 24px;
  text-align: left;
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
}

.styled-table td {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.95rem;
}

.text-bold { font-weight: 600; color: #1e293b; }

.badge {
  background: #dcfce7;
  color: #166534;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-right: 10px;
}

.cargo-text { color: #64748b; font-size: 0.85rem; }

/* AÃ§Ãµes na Tabela */
.btn-action {
  background: none;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.edit { color: #2563eb; margin-right: 15px; }
.delete { color: #be123c; }
.text-center { text-align: center; }

@media (max-width: 600px) {
  .form-row { grid-template-columns: 1fr; }
}
</style>