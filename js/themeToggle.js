// Alternância de tema claro/escuro. O tema escolhido fica salvo no
// localStorage e é reaplicado assim que a página carrega (o <script> inline
// no <head> de cada página já aplica o atributo antes da primeira pintura,
// para não haver "flash" do tema errado). Aqui só cuidamos do clique nos
// botões (desktop e mobile) e da troca do ícone/texto.
(function () {
  const CHAVE = "pense-ead-tema";

  function temaEscuroAtivo() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function atualizarBotoes() {
    const escuro = temaEscuroAtivo();

    document.querySelectorAll(".botao-tema").forEach((botao) => {
      const icone = botao.querySelector(".material-icons");
      const texto = botao.querySelector(".botao-tema-texto");

      if (icone) icone.textContent = escuro ? "light_mode" : "dark_mode";
      if (texto) texto.textContent = escuro ? "Tema claro" : "Tema escuro";

      botao.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
      botao.setAttribute("title", escuro ? "Tema claro" : "Tema escuro");
    });
  }

  function aplicarTema(tema) {
    if (tema === "escuro") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    try {
      localStorage.setItem(CHAVE, tema);
    } catch (erro) {
      // Navegação privada ou storage bloqueado: o tema só não persiste entre visitas.
    }

    atualizarBotoes();
  }

  function alternarTema() {
    aplicarTema(temaEscuroAtivo() ? "claro" : "escuro");
  }

  document.addEventListener("DOMContentLoaded", function () {
    atualizarBotoes();
    document.querySelectorAll(".botao-tema").forEach((botao) => {
      botao.addEventListener("click", alternarTema);
    });
  });
})();
