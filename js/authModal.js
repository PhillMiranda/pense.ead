// Ícone de conta no menu -> abre um modal de login/cadastro no formato
// "paisagem" que o Phill aprovou: um painel escuro fixo desliza de um lado
// para o outro (translateX 0%/100%) enquanto os dois formulários, cada um
// parado no seu lado, alternam com fade. Aqui só aplicamos a identidade do
// pense.ead (cores/fonte de css/global.css e a logo) e ligamos tudo ao
// Supabase. Injeta o HTML do modal uma vez (mesmo padrão do rodape.js).
(function () {
  const TEXTOS = {
    login: {
      titulo: "Bem-vindo(a) de volta!",
      texto: "Para continuar conectado conosco, por favor faça o login com suas informações pessoais.",
      botao: "Criar Conta",
    },
    cadastro: {
      titulo: "Que maravilha ter você fazendo parte da nossa turma!",
      texto: "Cadastre-se agora mesmo preenchendo seus dados para ter acesso completo à nossa plataforma.",
      botao: "Fazer Login",
    },
  };

  const MODAL_HTML = `
    <div class="auth-overlay" id="auth-overlay">
      <div class="auth-card" id="auth-card">
        <button type="button" class="auth-fechar" id="auth-fechar" aria-label="Fechar">
          <i class="material-icons">close</i>
        </button>

        <div class="auth-painel" id="auth-painel">
          <img class="auth-painel-logo" src="/img/identidade_visual/icone_penseead.svg" alt="pense.ead" />
          <h1 class="auth-painel-titulo" id="auth-painel-titulo">${TEXTOS.login.titulo}</h1>
          <p class="auth-painel-texto" id="auth-painel-texto">${TEXTOS.login.texto}</p>
          <button type="button" class="auth-painel-botao" id="auth-painel-botao">
            <span id="auth-painel-botao-texto">${TEXTOS.login.botao}</span>
          </button>
        </div>

        <div class="auth-form-wrapper login" id="form-login-wrapper">
          <div class="auth-form-inner">
            <h2>Faça seu Login</h2>
            <p class="auth-form-sub">Entre com suas credenciais cadastradas.</p>
            <form id="form-login-modal" novalidate>
              <div class="auth-campo">
                <label>E-mail</label>
                <input type="email" name="email" placeholder="seu@email.com" required />
              </div>
              <div class="auth-campo auth-senha-wrap">
                <label>Senha</label>
                <input type="password" name="senha" id="login-password" placeholder="••••••••" required />
                <button type="button" class="auth-mostrar-senha" data-alvo="login-password">Mostrar</button>
              </div>
              <p class="auth-erro" hidden></p>
              <button type="submit" class="auth-botao-principal">Entrar no Sistema</button>
            </form>
          </div>
        </div>

        <div class="auth-form-wrapper cadastro" id="form-register-wrapper">
          <div class="auth-form-inner">
            <h2>Criar Conta</h2>
            <p class="auth-form-sub">Preencha os dados abaixo para se cadastrar.</p>
            <form id="form-cadastro-modal" novalidate>
              <div class="auth-campo">
                <label>Nome Completo</label>
                <input type="text" name="nome" placeholder="Seu nome completo" required />
              </div>
              <div class="auth-campo">
                <label>CPF</label>
                <input type="text" name="cpf" id="cpf-input" placeholder="000.000.000-00" maxlength="14" required />
              </div>
              <div class="auth-campo">
                <label>E-mail</label>
                <input type="email" name="email" placeholder="seu@email.com" required />
              </div>
              <div class="auth-campo auth-senha-wrap">
                <label>Senha</label>
                <input type="password" name="senha" id="register-password" placeholder="Crie uma senha" minlength="6" required />
                <button type="button" class="auth-mostrar-senha" data-alvo="register-password">Mostrar</button>
              </div>
              <p class="auth-erro" hidden></p>
              <button type="submit" class="auth-botao-principal">Cadastrar Conta</button>
            </form>
          </div>
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

  // Inicializa o cliente Supabase usando jsdelivr (na allowlist da Vercel).
  async function carregarSupabase() {
    try {
      const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
      const cfg = await import(/* @vite-ignore */ caminhoApp("js/config.js"));
      return createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    } catch (erro) {
      console.warn("Supabase não pôde ser carregado:", erro);
      return null;
    }
  }

  function mostrarErro(form, mensagem) {
    const erro = form.querySelector(".auth-erro");
    erro.textContent = mensagem;
    erro.hidden = false;
  }

  // Máscara automática para CPF (000.000.000-00), igual ao modelo aprovado.
  function mascararCPF(input) {
    let valor = input.value.replace(/\D/g, "").slice(0, 11);
    if (valor.length > 9) {
      valor = valor.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
    } else if (valor.length > 6) {
      valor = valor.replace(/^(\d{3})(\d{3})(\d{3}).*/, "$1.$2.$3");
    } else if (valor.length > 3) {
      valor = valor.replace(/^(\d{3})(\d{3}).*/, "$1.$2");
    }
    input.value = valor;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.body.insertAdjacentHTML("beforeend", MODAL_HTML);

    const overlay = document.getElementById("auth-overlay");
    const card = document.getElementById("auth-card");
    const painel = document.getElementById("auth-painel");
    const loginWrapper = document.getElementById("form-login-wrapper");
    const registerWrapper = document.getElementById("form-register-wrapper");
    const painelTitulo = document.getElementById("auth-painel-titulo");
    const painelTexto = document.getElementById("auth-painel-texto");
    const painelBotaoTexto = document.getElementById("auth-painel-botao-texto");

    let modoCadastro = false;

    // Só o painel escuro se move de verdade (translateX); os dois
    // formulários ficam parados, cada um no seu lado, e alternam opacidade.
    function aplicarModo() {
      card.classList.toggle("cadastro-ativo", modoCadastro);

      if (modoCadastro) {
        painel.style.transform = "translateX(100%)";
        loginWrapper.style.opacity = "0";
        loginWrapper.style.pointerEvents = "none";
        registerWrapper.style.opacity = "1";
        registerWrapper.style.pointerEvents = "auto";
      } else {
        painel.style.transform = "translateX(0%)";
        registerWrapper.style.opacity = "0";
        registerWrapper.style.pointerEvents = "none";
        loginWrapper.style.opacity = "1";
        loginWrapper.style.pointerEvents = "auto";
      }

      const textos = modoCadastro ? TEXTOS.cadastro : TEXTOS.login;
      painelTitulo.textContent = textos.titulo;
      painelTexto.textContent = textos.texto;
      painelBotaoTexto.textContent = textos.botao;
    }

    function alternarModo() {
      modoCadastro = !modoCadastro;
      aplicarModo();
    }

    function abrirModal(modoInicial) {
      modoCadastro = modoInicial === "cadastro";
      aplicarModo();
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
    document.getElementById("auth-painel-botao").addEventListener("click", alternarModo);

    overlay.addEventListener("click", (evento) => {
      if (evento.target === overlay) fecharModal();
    });

    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape" && overlay.classList.contains("auth-overlay--aberto")) {
        fecharModal();
      }
    });

    // Botões "Mostrar" / "Ocultar" de cada campo de senha.
    document.querySelectorAll(".auth-mostrar-senha").forEach((botao) => {
      botao.addEventListener("click", () => {
        const input = document.getElementById(botao.dataset.alvo);
        if (!input) return;
        const oculto = input.type === "password";
        input.type = oculto ? "text" : "password";
        botao.textContent = oculto ? "Ocultar" : "Mostrar";
      });
    });

    document.getElementById("cpf-input").addEventListener("input", function () {
      mascararCPF(this);
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
        options: { data: { nome: dados.get("nome"), cpf: dados.get("cpf") } },
      });

      if (error) {
        mostrarErro(formCadastro, error.message);
        return;
      }

      location.href = caminhoApp("pages/dashboard.html");
    });
  });
})();
