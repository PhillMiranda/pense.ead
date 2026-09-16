// Bottom navigation bar — visível apenas em mobile (≤ 992px)
// Os eventos de tema e modal são registrados aqui diretamente,
// sem depender da ordem de carregamento dos outros scripts.
(function () {
  const NAV_HTML = `
    <nav class="bottom-nav" id="bottom-nav" role="navigation" aria-label="Menu principal mobile">
      <a href="/" class="bottom-nav__item" id="bn-home" aria-label="Página inicial">
        <i class="material-icons">home</i>
        <span>Início</span>
      </a>
      <a href="/pages/cursos.html" class="bottom-nav__item" id="bn-cursos" aria-label="Cursos">
        <i class="material-icons">school</i>
        <span>Cursos</span>
      </a>
      <button type="button" class="bottom-nav__item" id="bn-tema" aria-label="Alternar tema">
        <i class="material-icons" id="bn-tema-icone">dark_mode</i>
        <span id="bn-tema-texto">Tema escuro</span>
      </button>
      <button type="button" class="bottom-nav__item" id="bn-conta" aria-label="Entrar ou criar conta">
        <i class="material-icons">account_circle</i>
        <span>Conta</span>
      </button>
    </nav>
  `;

  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertAdjacentHTML("beforeend", NAV_HTML);

    // --- Marca item ativo ---
    const path = window.location.pathname;
    document.querySelectorAll(".bottom-nav__item[href]").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === path || (path === "/" && href === "/")) {
        link.classList.add("bottom-nav__item--ativo");
      }
    });

    // --- Botão tema ---
    const CHAVE_TEMA = "pense-ead-tema";
    const btnTema   = document.getElementById("bn-tema");
    const icoTema   = document.getElementById("bn-tema-icone");
    const txtTema   = document.getElementById("bn-tema-texto");

    function sincronizarIconeTema() {
      const escuro = document.documentElement.getAttribute("data-theme") === "dark";
      icoTema.textContent = escuro ? "light_mode" : "dark_mode";
      txtTema.textContent = escuro ? "Tema claro" : "Tema escuro";
    }

    sincronizarIconeTema();

    btnTema.addEventListener("click", function () {
      const escuro = document.documentElement.getAttribute("data-theme") === "dark";
      if (escuro) {
        document.documentElement.removeAttribute("data-theme");
        try { localStorage.setItem(CHAVE_TEMA, "claro"); } catch (e) {}
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        try { localStorage.setItem(CHAVE_TEMA, "escuro"); } catch (e) {}
      }
      // Sincroniza todos os botões de tema da página (desktop + bottom nav)
      document.querySelectorAll(".botao-tema").forEach(function (b) {
        const ic = b.querySelector(".material-icons");
        const tx = b.querySelector(".botao-tema-texto");
        const agora = document.documentElement.getAttribute("data-theme") === "dark";
        if (ic) ic.textContent = agora ? "light_mode" : "dark_mode";
        if (tx) tx.textContent = agora ? "Tema claro" : "Tema escuro";
      });
      sincronizarIconeTema();
    });

    // --- Botão conta (abre modal de login) ---
    document.getElementById("bn-conta").addEventListener("click", function () {
      const overlay = document.getElementById("auth-overlay");
      if (overlay) {
        overlay.classList.add("auth-overlay--aberto");
      }
    });
  });
})();
