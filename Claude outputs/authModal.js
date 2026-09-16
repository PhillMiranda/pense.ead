// Ícone de conta no menu -> abre um modal de login/cadastro com uma diagonal
// azul/branca que desliza de um lado para o outro ao trocar de modo (feito
// com clip-path, sem depender de rotação de retângulos — mais simples e
// estável). Cores e fonte seguem a identidade visual do site (variáveis de
// css/global.css e a logo de img/identidade_visual). Injeta o HTML do modal
// uma vez (mesmo padrão do rodape.js) e liga os formulários ao Supabase.
(function () {
  const MODAL_HTML = `
    <div class="auth-overlay" id="auth-overlay">
      <div class="auth-card" role="dialog" aria-modal="true" aria-label="Entrar ou criar conta">
        <input type="checkbox" id="auth-toggle" class="auth-toggle" />

        <div class="auth-topo">
          <div class="auth-diagonal"></div>
          <img class="auth-logo" src="/img/identidade_visual/icone_penseead.svg" alt="" aria-hidden="true" />

          <button type="button" class="auth-fechar" id="auth-fechar" aria-label="Fechar">
            <i class="material-icons">close</i>
          </button>

          <div class="auth-form login">
            <form id="form-login-modal" novalidate>
              <h3>Bem-vindo(a) de volta</h3>
              <label class="auth-input-grupo">
                <input class="auth-input" type="email" name="email" placeholder="Informe seu login" required />
                <i class="material-icons">person</i>
              </label>
              <label class="auth-input-grupo">
                <input class="auth-input" type="password" name="senha" placeholder="Informe sua senha" required />
                <i class="material-icons">lock</i>
              </label>
              <p class="auth-erro" hidden></p>
              <p class="auth-troca">
                Precisa criar uma conta nova?
                <button type="button" class="auth-link auth-troca-link" data-modo="cadastro">Clique aqui!</button>
              </p>
              <!-- Botão de fato mora na barra azul embaixo do card; este aqui
                   fica invisível só para o Enter continuar enviando o form. -->
              <button type="submit" class="auth-submit-oculto" tabindex="-1" aria-hidden="true"></button>
            </form>
          </div>

          <div class="auth-form cadastro">
            <form id="form-cadastro-modal" novalidate>
              <h3>Criar sua conta</h3>
              <label class="auth-input-grupo">
                <input class="auth-input" type="text" name="nome" placeholder="Nome completo" required />
                <i class="material-icons">person</i>
              </label>
              <label class="auth-input-grupo">
                <input class="auth-input" type="email" name="email" placeholder="E-mail" required />
                <i class="material-icons">mail</i>
              </label>
              <label class="auth-input-grupo">
                <input class="auth-input" type="password" name="senha" placeholder="Senha (mín. 6 caracteres)" minlength="6" required />
                <i class="material-icons">lock</i>
              </label>
              <p class="auth-erro" hidden></p>
              <p class="auth-troca">
                Já tem uma conta?
                <button type="button" class="auth-link auth-troca-link" data-modo="login">Clique aqui!</button>
              </p>
              <button type="submit" class="auth-submit-oculto" tabindex="-1" aria-hidden="true"></button>
            </form>
          </div>
        </div>

        <div class="auth-rodape">
          <button type="button" class="auth-botao login" data-form-alvo="form-login-modal">Entrar</button>
          <button type="button" class="auth-botao cadastro" data-form-alvo="form-cadastro-modal">Criar conta</button>
        </div>
      </div>
    </div>
  `;

  // Resolve o caminho da plataforma (app/) relativo à página atual, já que
  // o modal é usado tanto em /index.html quanto em /pages/cursos.html.
  function caminhoApp(destino) {
    const base = location.pathname.includes("/pages/") ? "../app/" : "app/";
    return base + destino;
  }

  // Carrega o cliente do Supabase sob demanda. Só funciona depois que
  // app/js/config.js existir (copie de app/js/config.example.js e preencha
  // com as chaves do seu projeto Supabase) — até lá, os formulários avisam
  // que a autenticação ainda não está configurada, sem quebrar o resto do site.
  async function carregarSupabase() {
    try {
      const modulo = await import(/* @vite-ignore */ caminhoApp("js/supabaseClient.js"));
      return modulo.supabase;
    } catch (erro) {
      console.warn(
        "Supabase ainda não configurado (app/js/config.js). Copie app/js/config.example.js e preencha as chaves do projeto.",
        erro
      );
      return null;
    }
  }

  function mostrarErro(form, mensagem) {
    const erro = form.querySelector(".auth-erro");
    erro.textContent = mensagem;
    erro.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertAdjacentHTML("beforeend", MODAL_HTML);

    const overlay = document.getElementById("auth-overlay");
    const toggle = document.getElementById("auth-toggle");

    function abrirModal(modoInicial) {
      toggle.checked = modoInicial === "cadastro";
      overlay.classList.add("auth-overlay--aberto");
      document.body.style.overflow = "hidden";
    }

    function fecharModal() {
      overlay.classList.remove("auth-overlay--aberto");
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".botao-conta").forEach((botao) => {
      botao.addEventListener("click", () => abrirModal("login"));
    });

    document.getElementById("auth-fechar").addEventListener("click", fecharModal);

    overlay.addEventListener("click", (evento) => {
      if (evento.target === overlay) fecharModal();
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && overlay.classList.contains("auth-overlay--aberto")) {
        fecharModal();
      }
    });

    // Link "Clique aqui!" dentro do próprio formulário troca entre login/cadastro
    // (é o que dispara a transição da diagonal — ver .auth-diagonal no CSS).
    document.querySelectorAll(".auth-troca-link").forEach((botao) => {
      botao.addEventListener("click", () => {
        toggle.checked = botao.dataset.modo === "cadastro";
      });
    });

    // Botões "Entrar" / "Criar conta" ficam na barra azul embaixo do card,
    // fora da tag <form> — então disparam o submit do formulário certo.
    document.querySelectorAll(".auth-rodape .auth-botao").forEach((botao) => {
      botao.addEventListener("click", () => {
        const form = document.getElementById(botao.dataset.formAlvo);
        if (form) form.requestSubmit();
      });
    });

    const formLogin = document.getElementById("form-login-modal");
    const formCadastro = document.getElementById("form-cadastro-modal");

    formLogin.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      formLogin.querySelector(".auth-erro").hidden = true;

      const supabase = await carregarSupabase();
      if (!supabase) {
        mostrarErro(formLogin, "O login ainda não está configurado neste ambiente.");
        return;
      }

      const dados = new FormData(formLogin);
      const { error } = await supabase.auth.signInWithPassword({
        email: dados.get("email"),
        password: dados.get("senha"),
      });

      if (error) {
        mostrarErro(formLogin, "E-mail ou senha inválidos.");
        return;
      }

      location.href = caminhoApp("pages/dashboard.html");
    });

    formCadastro.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      formCadastro.querySelector(".auth-erro").hidden = true;

      const supabase = await carregarSupabase();
      if (!supabase) {
        mostrarErro(formCadastro, "O cadastro ainda não está configurado neste ambiente.");
        return;
      }

      const dados = new FormData(formCadastro);
      const { error } = await supabase.auth.signUp({
        email: dados.get("email"),
        password: dados.get("senha"),
        options: { data: { nome: dados.get("nome") } },
      });

      if (error) {
        mostrarErro(formCadastro, error.message);
        return;
      }

      location.href = caminhoApp("pages/dashboard.html");
    });
  });
})();
