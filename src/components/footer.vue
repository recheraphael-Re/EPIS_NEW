<template>
<footer class="footer">
    <div class="footer__contato">
        <h4>Contato</h4>
        <p><a href="mailto:suporte@epi.com">suporte@epi.com</a></p>
    </div>
    <div class="footer__redes">
        <h4>Redes sociais</h4>
        <div class="footer__redes-links">
        <a href="#">LinkedIn</a>
        <a href="#">Instagram</a>
        <a href="#">Facebook</a>
    </div>
    </div>

    <div class="footer__copy">
        <p>© 2026 Sistema de Gestão de EPI — Todos os direitos reservados</p>
    </div>

</footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>



<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;   
  gap: 2rem;
  padding: 2rem;
  background: #1E3A5F;
  color: #c6c8ebc5;
}

.footer h4 {
    font-size: 14px;
    margin: 0 0 10px;
    color: #F97316;
}

.footer p, .footer a {
    font-size: 13px;
    color: #2367bb;
    text-decoration: none;
    margin: 0;
}

.footer a:hover { color: #F97316; }
.footer__redes-links {
    display: flex;
    gap: 12px;
}

.footer__copy {
    width: 100%;
    text-align: center;
    border-top: 1px solid #2d4f7c;
    padding-top: 1rem;
}

</style>