<template>
  <main class="home">
   <Menu />
    <!-- HERO -->
    <section class="home__hero">
      <div class="home__hero-texto">
        <h1>Sistema de Gestão de EPI</h1>
        <p>Gerencie os EPIs dos seus colaboradores de forma simples e segura.</p>
      </div>

      <div class="home__hero-imagem">
        <img src="../assets/logoEPI.jpg" alt="Trabalhador com EPI" class="home__hero-img" />
      </div> 
    </section>

    <!-- CARDS -->
    <section class="home__cards">
      <div class="card">
        <span class="card__icone"></span>
        <strong class="card__numero">124</strong>
        <p class="card__label">Total de EPIs</p>
      </div>

      <div class="card">
        <span class="card__icone"></span>
        <strong class="card__numero">48</strong>
        <p class="card__label">Colaboradores</p>
      </div>

      <div class="card">
        <span class="card__icone"></span>
        <strong class="card__numero">89</strong>
        <p class="card__label">Entregas realizadas</p>
      </div>

      <div class="card card--alerta">
        <span class="card__icone"></span>
        <strong class="card__numero">7</strong>
        <p class="card__label">EPIs vencendo</p>
      </div>
    </section>

    <!-- INSTRUÇÕES -->
    <section class="home__instrucoes">
      <h2 class="home__instrucoes-titulo">Como usar o sistema</h2>

      <div class="home__passos">
        <article class="passo">
          <span class="passo__numero">1</span>
          <span style='font-size:100px;'>&#128187;</span>
          <h3>Cadastre os colaboradores</h3>
          <p>Acesse o menu Colaboradores e registre cada funcionário com seus dados.</p>
        </article>

        <article class="passo">
          <span class="passo__numero">2</span>
          <span style='font-size:100px;'>&#129405;</span>
          <h3>Cadastre os EPIs</h3>
          <p>Vá em Equipamentos e adicione os EPIs disponíveis com validade e quantidade.</p>
        </article>

        <article class="passo">
          <span class="passo__numero">3</span>
          <span style='font-size:100px;'>&#128221;</span>
          <h3>Registre as entregas</h3>
          <p>Em Entregas, vincule o EPI ao colaborador e registre a data de entrega.</p>
        </article>

        <article class="passo">
          <span class="passo__numero">4</span>
          <span style='font-size:100px;'>&#128196;</span>
          <h3>Acompanhe os relatórios</h3>
          <p>Monitore validades e histórico de entregas pelo menu Relatórios.</p>
        </article>
      </div>
    </section>

    <Footer />
    </main>
  
</template>

<script>
import Menu from '../components/Menu.vue'

import Footer from '../components/Footer.vue'

export default {
  name: 'home',
  components: {
    Menu,
    Footer
  }
}
</script>


<style scoped>
/* JUNTE TODOS OS ESTILOS AQUI */

.home{
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.home__hero{
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.home__hero-texto{ flex: 1; }
.home__hero-imagem{ flex: 1; }

.home__hero-texto h1{
  font-size: 28px;
  color: #1E3A5F;
  margin-bottom: 1rem;
}

.home__hero-texto p{
  font-size: 15px;
  color: #555;
  line-height: 1.7;
}

.home__hero-img{
  width: 100%;
  border-radius: 12px;
}

.home__cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card{
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
}

.card--alerta{
  border-color: #F97316;
  background: #FFF7ED;
}

.card__icone{
  font-size: 32px;
  margin-bottom: 8px;
}

.card__numero{
  font-size: 28px;
  color: #1E3A5F;
}

.card__label{
  font-size: 15px;
  color: #555;
  margin-top: 4px;
}
.home__instrucoes-titulo{
  font-size: 22px;
  color: #1E3A5F;
  margin-bottom: 2rem;
}

.home__passos{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.passo{
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.5rem;
}

.passo__numero{
  font-size: 18px;
  color: #F97316;
  font-weight: 600;
  margin-bottom: 8px;
}

.passo h3{
  font-size: 16px;
  color: #1E3A5F;
  margin-bottom: 8px;
}

.passo p{
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}

</style>










