// Bottom navigation bar — visível apenas em mobile (≤ 992px)
(function () {
  const NAV_HTML = `
    <nav class="bottom-nav" id="bottom-nav" aria-label="Navegação principal">
      <a href="/" class="bn-item" id="bn-home" aria-label="Início">
        <i class="material-icons">home</i>
      </a>
      <a href="/pages/cursos.html" class="bn-item" id="bn-cursos" aria-label="Cursos">
        <i class="material-icons">school</i>
      </a>
      <button type="button" class="bn-item" id="bn-tema" aria-label="Alternar tema">
        <i class="material-icons" id="bn-tema-icone">dark_mode</i>
      </button>
      <button type="button" class="bn-item" id="bn-conta" aria-label="Minha conta">
        <i class="material-icons">account_circle</i>
      </button>
    </nav>
  `;

  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertAdjacentHTML("beforeend", NAV_HTML);

    // Marca item ativo pela URL
    const path = window.location.pathname;
    document.querySelectorAll(".bn-item[href]").forEach(function (link) {
      const href = link.getAttribute("href");
      if (href === path || (path === "/" && href === "/")) {
        link.classList.add("bn-ativo");
      }
    });

    // Tema
    const CHAVE = "pense-ead-tema";
    const icoTema = document.getElementById("bn-tema-icone");

    function sincTema() {
      const escuro = document.documentElement.getAttribute("data-theme") === "dark";
      icoTema.textContent = escuro ? "light_mode" : "dark_mode";
    }
    sincTema();

    document.getElementById("bn-tema").addEventListener("click", function () {
      const escuro = document.documentElement.getAttribute("data-theme") === "dark";
      if (escuro) {
        document.documentElement.removeAttribute("data-theme");
        try { localStorage.setItem(CHAVE, "claro"); } catch (e) {}
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
        try { localStorage.setItem(CHAVE, "escuro"); } catch (e) {}
      }
      // Sincroniza botões do menu desktop
      document.querySelectorAll(".botao-tema").forEach(function (b) {
        const ic = b.querySelector(".material-icons");
        const tx = b.querySelector(".botao-tema-texto");
        const ag = document.documentElement.getAttribute("data-theme") === "dark";
        if (ic) ic.textContent = ag ? "light_mode" : "dark_mode";
        if (tx) tx.textContent = ag ? "Tema claro" : "Tema escuro";
      });
      sincTema();
    });

    // Conta
    document.getElementById("bn-conta").addEventListener("click", function () {
      const overlay = document.getElementById("auth-overlay");
      if (overlay) overlay.classList.add("auth-overlay--aberto");
    });
  });
})();
