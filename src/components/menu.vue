<template>
  <header class=navbar>

    <div class="navbar__marca">
        <img  axe-liner (image-alt): Imagens must have alternative text
        src="../assets/logo.png"
        alt= "Logo EPI"
        class="navbar__logo"
        />

    </div>

    <nav aria-label="Menu principal">
        <ul class="navbar__lista">
            <li><RouterLink to="/" class="navbar__link">Home</RouterLink></li>
            <li><RouterLink to="/funcionario" class="navbar__link">Funcionário</RouterLink></li>
            <li><RouterLink to="/estoque" class="navbar__link">Estoque</RouterLink></li>
            <li><RouterLink to="/entrega" class="navbar__link">Entrega</RouterLink></li>
            <li><RouterLink to="/cadastro" class="navbar__link">Cadastro</RouterLink></li>
            <li><RouterLink to="/epi" class="navbar__link">EPI</RouterLink></li>
            <li><RouterLink to="/dashboard" class="navbar__link">Dashboard</RouterLink></li>
            <li><RouterLink to="/fornecedor" class="navbar__link">Fornecedor</RouterLink></li>
            <li><RouterLink to="/setor" class="navbar__link">Setor</RouterLink></li>

      </ul>
    </nav>

    <RouterLink to="/login" class="navbar__login"
    <button type="button" class="navbar__btn">Entrar</button>
    </RouterLink>
    </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #333;
  padding: 10px 20px;
  height: 58px;
  border-bottom: 1px solid #444;
  gap: 1rem
}
.navbar__marca {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.navbar__logo {
  height: 40px;
  width: auto;
  display: block;
}
.navbar__lista {
  display: flex;
  list-style: none;
  align-items: center;
  margin: 0;
  padding: 0;
  gap: 2px;
}
.navbar__link {
  color: #fff;
  display: block;
  padding: 6px 12px;
  border-radius: 7px;
  font-size: 13.5px;
  font-weight: 500;
  text-decoration: none;
  letter-spacing: -0.01em;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
  
}
.navbar__link:hover {
  background-color: #555;
  color: #e6de07;
}
.navbar__link.router-link-active {
    background-color: #555;
    color: #e6de07;
    font-weight: 600;

}
.navbar__login {
  text-decoration: none;
  flex-shrink: 0;
}
.navbar__btn {
  background: #e68507;
  color: #333;
  border: none;
  padding: 7px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.navbar__btn:hover {
  background: #6be607;
  
}
.navbar__btn:active {
  transform: scale(0.97);
}
</style>



        


