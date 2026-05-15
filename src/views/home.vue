<template>
  <main class="home-wrap">
    <Menu />

    <div class="home">
      <!-- HERO -->
      <section class="home__hero">
        <div class="home__hero-texto">
          <h1>Sistema de Gestão de EPI</h1>
          <p>Gerencie os EPIs dos seus colaboradores de forma simples e segura.</p>
          <div class="home__hero-actions">
            <RouterLink to="/applayout/dashboard" class="btn-cta">
              <i class="fas fa-arrow-right-to-bracket"></i> Acessar Sistema
            </RouterLink>
            <a href="#como-usar" class="btn-cta-outline">
              <i class="fas fa-circle-info"></i> Como usar
            </a>
          </div>
        </div>

        <div class="home__hero-imagem">
          <img src="../assets/logoEPI.jpg" alt="SafeEPI" class="home__hero-img" />
        </div>
      </section>

      <!-- CARDS -->
      <section class="home__cards">
        <div class="card">
          <span class="card__icone" style="color:#22c55e;background:#f0fdf4">
            <i class="fas fa-hard-hat"></i>
          </span>
          <strong class="card__numero">
            <span v-if="loading" class="card__skeleton"></span>
            <span v-else>{{ stats.totalEPIs }}</span>
          </strong>
          <p class="card__label">Total de EPIs</p>
        </div>

        <div class="card">
          <span class="card__icone" style="color:#3b82f6;background:#eff6ff">
            <i class="fas fa-users"></i>
          </span>
          <strong class="card__numero">
            <span v-if="loading" class="card__skeleton"></span>
            <span v-else>{{ stats.totalFuncionarios }}</span>
          </strong>
          <p class="card__label">Colaboradores</p>
        </div>

        <div class="card">
          <span class="card__icone" style="color:#f97316;background:#fff7ed">
            <i class="fas fa-box-open"></i>
          </span>
          <strong class="card__numero">
            <span v-if="loading" class="card__skeleton"></span>
            <span v-else>{{ stats.totalEntregas }}</span>
          </strong>
          <p class="card__label">Entregas realizadas</p>
        </div>

        <div class="card card--alerta">
          <span class="card__icone" style="color:#ef4444;background:#fef2f2">
            <i class="fas fa-triangle-exclamation"></i>
          </span>
          <strong class="card__numero">
            <span v-if="loading" class="card__skeleton"></span>
            <span v-else>{{ stats.episVencendo }}</span>
          </strong>
          <p class="card__label">EPIs vencendo</p>
        </div>
      </section>

      <!-- BENEFÍCIOS -->
      <section class="home__beneficios">
        <h2 class="home__beneficios-titulo">Por que escolher o SafeEPI?</h2>
        <div class="beneficios-grid">
          <div class="beneficio">
            <i class="fas fa-shield-halved beneficio__icon"></i>
            <h3>Conforme NR-6</h3>
            <p>Atende às normas regulamentadoras de Segurança do Trabalho para fornecimento e controle de EPIs.</p>
          </div>
          <div class="beneficio">
            <i class="fas fa-signature beneficio__icon"></i>
            <h3>Assinatura digital</h3>
            <p>Registro de recibo de entrega com confirmação do colaborador, sem papelada.</p>
          </div>
          <div class="beneficio">
            <i class="fas fa-file-pdf beneficio__icon"></i>
            <h3>Relatórios em PDF</h3>
            <p>Exporte históricos por funcionário, EPI ou período em PDF prontos para auditoria.</p>
          </div>
          <div class="beneficio">
            <i class="fas fa-bell beneficio__icon"></i>
            <h3>Alertas de validade</h3>
            <p>Receba avisos de CAs e EPIs vencendo antes que se tornem um problema.</p>
          </div>
        </div>
      </section>

      <!-- INSTRUÇÕES -->
      <section class="home__instrucoes" id="como-usar">
        <h2 class="home__instrucoes-titulo">Como usar o sistema</h2>

        <div class="home__passos">
          <article class="passo">
            <span class="passo__numero">1</span>
            <i class="fas fa-user-plus passo__icon"></i>
            <h3>Cadastre os colaboradores</h3>
            <p>Acesse o menu Funcionários e registre cada colaborador com seus dados.</p>
          </article>

          <article class="passo">
            <span class="passo__numero">2</span>
            <i class="fas fa-hard-hat passo__icon"></i>
            <h3>Cadastre os EPIs</h3>
            <p>Vá em Cadastro EPI e adicione os equipamentos com CA e validade.</p>
          </article>

          <article class="passo">
            <span class="passo__numero">3</span>
            <i class="fas fa-box-open passo__icon"></i>
            <h3>Registre as entregas</h3>
            <p>Em Entregas, vincule o EPI ao colaborador com assinatura digital.</p>
          </article>

          <article class="passo">
            <span class="passo__numero">4</span>
            <i class="fas fa-file-lines passo__icon"></i>
            <h3>Acompanhe os relatórios</h3>
            <p>Monitore validades e histórico pelo menu Relatórios, com exportação em PDF.</p>
          </article>
        </div>
      </section>
    </div>

    <Footer />
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import Menu from '../components/Menu.vue'
import Footer from '../components/Footer.vue'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()

const loading = ref(true)
const stats = reactive({
  totalEPIs: 0,
  totalFuncionarios: 0,
  totalEntregas: 0,
  episVencendo: 0
})

onMounted(async () => {
  const hoje = new Date().toISOString().split('T')[0]
  const em30 = new Date()
  em30.setDate(em30.getDate() + 30)
  const dataLimite = em30.toISOString().split('T')[0]

  const [
    { count: cEpi },
    { count: cFunc },
    { count: cEnt },
    { count: cVenc }
  ] = await Promise.all([
    supabase.from('epi').select('*', { count: 'exact', head: true }),
    supabase.from('funcionarios').select('*', { count: 'exact', head: true }),
    supabase.from('entregas').select('*', { count: 'exact', head: true }),
    supabase.from('epi').select('*', { count: 'exact', head: true })
      .gte('validade', hoje).lte('validade', dataLimite)
  ])

  stats.totalEPIs = cEpi || 0
  stats.totalFuncionarios = cFunc || 0
  stats.totalEntregas = cEnt || 0
  stats.episVencendo = cVenc || 0
  loading.value = false
})
</script>

<style scoped>
.home-wrap { background: #f8fafc; min-height: 100vh; }

.home {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.home__hero {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.home__hero-texto { flex: 1; }
.home__hero-imagem { flex: 1; }

.home__hero-texto h1 {
  font-size: 32px;
  color: #1E3A5F;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.home__hero-texto p {
  font-size: 16px;
  color: #555;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.home__hero-actions {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
}

.btn-cta {
  background: #F97316;
  color: #fff;
  padding: .75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: .95rem;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  transition: background .15s, transform .1s;
  box-shadow: 0 2px 8px rgba(249,115,22,0.25);
}
.btn-cta:hover { background: #ea580c; transform: translateY(-1px); }

.btn-cta-outline {
  background: #fff;
  color: #1E3A5F;
  padding: .75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: .95rem;
  border: 1.5px solid #cbd5e1;
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  transition: background .15s;
}
.btn-cta-outline:hover { background: #f1f5f9; }

.home__hero-img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(30,58,95,0.12);
}

.home__cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.card--alerta {
  border-color: #F97316;
  background: #FFF7ED;
}

.card__icone {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 12px;
}

.card__numero {
  font-size: 30px;
  color: #1E3A5F;
  font-weight: 700;
  line-height: 1;
  min-height: 30px;
}

.card__skeleton {
  display: inline-block;
  width: 40px; height: 24px;
  background: linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: skeleton 1.2s infinite;
}
@keyframes skeleton {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.card__label {
  font-size: 14px;
  color: #555;
  margin-top: 8px;
  text-align: center;
}

/* Benefícios */
.home__beneficios { margin-bottom: 3rem; }
.home__beneficios-titulo {
  font-size: 22px;
  color: #1E3A5F;
  margin-bottom: 1.5rem;
  text-align: center;
}
.beneficios-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}
.beneficio {
  background: #fff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.beneficio__icon {
  font-size: 28px;
  color: #F97316;
  margin-bottom: .75rem;
}
.beneficio h3 {
  font-size: 15px;
  color: #1E3A5F;
  margin-bottom: .5rem;
}
.beneficio p {
  font-size: 13px;
  color: #555;
  line-height: 1.55;
}

/* Instruções */
.home__instrucoes-titulo {
  font-size: 22px;
  color: #1E3A5F;
  margin-bottom: 2rem;
  text-align: center;
}

.home__passos {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.passo {
  background: #ffffff;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  position: relative;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.passo__numero {
  position: absolute;
  top: -12px; left: 1.25rem;
  width: 30px; height: 30px;
  background: #F97316;
  color: #fff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.passo__icon {
  font-size: 40px;
  color: #1E3A5F;
  margin: .5rem 0 1rem;
  display: block;
}

.passo h3 {
  font-size: 15px;
  color: #1E3A5F;
  margin-bottom: .5rem;
}

.passo p {
  font-size: 13px;
  color: #555;
  line-height: 1.55;
}
</style>
