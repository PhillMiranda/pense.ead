// Banner de consentimento de cookies próprio do site (sem dependências
// externas). Guarda a escolha do visitante no localStorage para não exibir
// o banner de novo a cada visita.

// ---------------------------------------------------------------------
// Remove o banner antigo (biblioteca "cookieconsent" injetada pelo Google
// Tag Manager — elemento `.cc-window`). Ele não faz parte dos arquivos do
// site; foi configurado direto no container do GTM em algum momento. O
// ideal é desativar a tag correspondente lá (procure por uma tag do tipo
// "HTML personalizado" com "cookie"/"consent" no nome, disparada em todas
// as páginas), mas isso já garante que só o banner novo apareça enquanto
// isso não é feito.
(function removerBannerAntigoDoGTM() {
  function remover() {
    document.querySelectorAll(".cc-window").forEach((el) => el.remove());
  }
  remover();
  new MutationObserver(remover).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();

(function () {
  const CHAVE_CONSENTIMENTO = "penseead_cookie_consent";

  function jaDecidiu() {
    try {
      return localStorage.getItem(CHAVE_CONSENTIMENTO) !== null;
    } catch (erro) {
      // Alguns navegadores bloqueiam localStorage (ex: modo anônimo
      // restrito). Nesse caso, tratamos como "ainda não decidiu" — o
      // banner pode reaparecer, mas o site continua funcionando.
      return false;
    }
  }

  function salvarDecisao(valor) {
    try {
      localStorage.setItem(CHAVE_CONSENTIMENTO, valor);
    } catch (erro) {
      console.warn("Não foi possível salvar a preferência de cookies:", erro);
    }
  }

  function fecharBanner(banner) {
    banner.classList.remove("cookie-consent--visivel");
    banner.classList.add("cookie-consent--saindo");
    banner.addEventListener("transitionend", () => banner.remove(), { once: true });
  }

  function criarBanner() {
    const banner = document.createElement("div");
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Aviso de cookies");
    banner.setAttribute("aria-live", "polite");

    banner.innerHTML = `
      <div class="cookie-consent__icone" aria-hidden="true">🍪</div>
      <div class="cookie-consent__conteudo">
        <div class="cookie-consent__texto">
          <strong>Nós usamos cookies</strong>
          <p>Usamos cookies para melhorar sua experiência, entender como você navega pelo site e personalizar conteúdo. Você pode mudar de ideia quando quiser.</p>
        </div>
        <div class="cookie-consent__acoes">
          <button type="button" class="cookie-consent__btn cookie-consent__btn--recusar">Recusar</button>
          <button type="button" class="cookie-consent__btn cookie-consent__btn--aceitar">Aceitar cookies</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    banner
      .querySelector(".cookie-consent__btn--aceitar")
      .addEventListener("click", () => {
        salvarDecisao("aceito");
        fecharBanner(banner);
      });

    banner
      .querySelector(".cookie-consent__btn--recusar")
      .addEventListener("click", () => {
        salvarDecisao("recusado");
        fecharBanner(banner);
      });

    // Aplica a classe num próximo frame para a transição de entrada rodar
    // (se aplicasse direto no innerHTML, o navegador não anima a mudança).
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add("cookie-consent--visivel"));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!jaDecidiu()) {
      criarBanner();
    }
  });
})();
