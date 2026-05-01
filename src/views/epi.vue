<template>
  <main class="epi">

    <!-- HEADER -->
    <section class="epi__header">
      <h1>Cadastro de EPIs</h1>
      <p>Gerencie os equipamentos de proteção individual.</p>
    </section>

    <!-- FORM -->
    <section class="epi__form">
      <form @submit.prevent="salvar">

        <div class="form__grupo">
          <label>Nome do EPI</label>
          <input
            type="text"
            v-model="form.nome"
            placeholder="Ex: Capacete"
            required
          />
        </div>

        <div class="form__grupo">
          <label>Quantidade</label>
          <input
            type="number"
            v-model="form.quantidade"
            min="1"
            required
          />
        </div>

        <div class="form__grupo">
          <label>Validade</label>
          <input
            type="date"
            v-model="form.validade"
            required
          />
        </div>

        <button type="submit" class="btn btn--salvar">
          {{ editandoId ? 'Salvar Alterações' : 'Adicionar EPI' }}
        </button>

        <button v-if="editandoId" type="button" class="btn btn--cancelar" @click="cancelarEdicao">
          Cancelar
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
            v-for="item in episFiltrados"
            :key="item.id"
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
              <button class="btn btn--editar" @click="prepararEdicao(item)">
                Editar
              </button>
              <button class="btn btn--remover" @click="excluir(item.id)">
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useSupabase } from '../composables/useSupabase';

const { supabase } = useSupabase();

// Lista de EPIs carregados do banco
const epi = ref([]);
const editandoId = ref(null);
const busca = ref('');

const form = reactive({
  nome: '',
  descricao: '',
  ca: '',
  validade: '',
  quantidade: ''
});

// Lista filtrada pela busca
const episFiltrados = computed(() => {
  if (!busca.value) return epi.value;
  return epi.value.filter(e =>
    e.nome.toLowerCase().includes(busca.value.toLowerCase())
  );
});

// Carrega todos os EPIs do Supabase
const carregar = async () => {
  const { data, error } = await supabase.from('epi').select('*').order('nome');
  if (error) {
    console.error('Erro ao carregar:', error.message);
  } else {
    epi.value = data || [];
  }
};

// Insere ou atualiza um EPI
const salvar = async () => {
  if (editandoId.value) {
    await supabase.from('epi').update(form).eq('id', editandoId.value);
  } else {
    await supabase.from('epi').insert([{ ...form }]);
  }
  cancelarEdicao();
  carregar();
};

// Preenche o formulário com os dados do item para edição
const prepararEdicao = (e) => {
  editandoId.value = e.id;
  Object.assign(form, {
    nome: e.nome,
    descricao: e.descricao,
    ca: e.ca,
    validade: e.validade,
    quantidade: e.quantidade
  });
};

// Exclui um EPI pelo id
const excluir = async (id) => {
  if (confirm('Deseja realmente remover este registro?')) {
    await supabase.from('epi').delete().eq('id', id);
    carregar();
  }
};

// Limpa o formulário e sai do modo de edição
const cancelarEdicao = () => {
  editandoId.value = null;
  Object.assign(form, { nome: '', descricao: '', ca: '', validade: '', quantidade: '' });
};

// Verifica se a validade já passou
const isVencido = (validade) => {
  if (!validade) return false;
  return new Date(validade) < new Date();
};

// Formata a data para exibição (DD/MM/AAAA)
const formatarData = (validade) => {
  if (!validade) return '-';
  const [ano, mes, dia] = validade.split('-');
  return `${dia}/${mes}/${ano}`;
};

onMounted(carregar);
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

/* BOTÕES */
.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  margin-right: 0.5rem;
}

.btn--salvar {
  background-color: #ff8c00;
  color: white;
}

.btn--salvar:hover {
  background-color: #e67e00;
}

.btn--cancelar {
  background-color: #6c757d;
  color: white;
}

.btn--cancelar:hover {
  background-color: #5a6268;
}

.btn--editar {
  background-color: #1f3a5f;
  color: white;
}

.btn--remover {
  background-color: #dc3545;
  color: white;
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

/* VAZIO */
.vazio {
  text-align: center;
  color: #999;
}
</style>