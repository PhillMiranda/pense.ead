// Bottom navigation bar — visível apenas em mobile (≤ 992px, breakpoint Materialize)
// Ícones: Home, Cursos, Tema claro/escuro, Login
(function () {
  const NAV_HTML = `
    <nav class="bottom-nav" id="bottom-nav" role="navigation" aria-label="Menu principal mobile">
      <a href="/" class="bottom-nav__item" aria-label="Página inicial">
        <i class="material-icons">home</i>
        <span>Início</span>
      </a>
      <a href="/pages/cursos.html" class="bottom-nav__item" aria-label="Cursos">
        <i class="material-icons">school</i>
        <span>Cursos</span>
      </a>
      <button type="button" class="bottom-nav__item botao-tema" aria-label="Alternar tema">
        <i class="material-icons">dark_mode</i>
        <span class="botao-tema-texto">Tema escuro</span>
      </button>
      <button type="button" class="bottom-nav__item botao-conta" aria-label="Entrar ou criar conta">
        <i class="material-icons">account_circle</i>
        <span>Minha conta</span>
      </button>
    </nav>
  `;

  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertAdjacentHTML("beforeend", NAV_HTML);

    // Marca o item ativo conforme a página atual
    const path = window.location.pathname;
    document.querySelectorAll(".bottom-nav__item[href]").forEach(function (link) {
      if (link.getAttribute("href") === path || (path === "/" && link.getAttribute("href") === "/")) {
        link.classList.add("bottom-nav__item--ativo");
      }
    });
  });
})();
