<template>
<main class="pagina">
<section class="card">
<h1>Cadastro de Funcionário</h1>
<form @submit.prevent="cadastrarFuncionario">
<label for="nome">Nome do funcionário</label>
<!-- v-model liga o input à variável nome -->
<input
id="nome"
v-model="nome"
type="text"
placeholder="Digite o nome"
/>
<!-- Só aparece se existir mensagem de erro -->
<p v-if="erro" class="erro">{{ erro }}</p>
<button type="submit">Cadastrar</button>
</form>
</section>
</main>
</template>

<script setup>
// ref cria variáveis reativas no Vue 3
import { ref } from 'vue'

// Guarda o nome digitado no formulário
const nome = ref('')

// Guarda a mensagem de erro
const erro = ref('')

function cadastrarFuncionario() {
erro.value = '' // Limpa erros anteriores       
if (nome.value.trim() === '') {
erro.value = 'O nome do funcionário é obrigatório.'
return
}
}
</script>