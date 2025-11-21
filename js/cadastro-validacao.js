$(document).ready(function () {
  console.log("Sistema de cadastro inicializado");

  // Evento: Validar código do cliente
  $("#form-validacao").on("submit", function (event) {
    event.preventDefault();
    validarCodigoCliente();
  });

  // Evento: Voltar para validação
  $("#btn-voltar").on("click", function () {
    voltarParaValidacao();
  });

  // Evento: Finalizar cadastro
  $("#form-cadastro").on("submit", function (event) {
    event.preventDefault();
    finalizarCadastro();
  });

  // Limpar erros ao digitar
  $("input").on("input", function () {
    limparErro($(this).closest("form").find(".erro-mensagem"));
  });
});

function validarCodigoCliente() {
  const codigo = $("#cpf-cliente").val().trim();
  const erroDiv = $("#erro-validacao");
  // Validação básica
  if (!codigo) {
    mostrarErro(erroDiv, "Por favor, preencha o código do cliente.");
    return;
  }

  if (codigo.length < 11) {
    mostrarErro(erroDiv, "Código inválido. Deve ter no mínimo 11 caracteres.");
    return;
  }

  // Simular chamada ao backend
  console.log("Validando código:", codigo);

  // AQUI VOCÊ DEVE FAZER A CHAMADA AJAX REAL
  // Exemplo de integração:
  /*
$.ajax({
    url: '/api/validar-cliente',
    method: 'POST',
    data: JSON.stringify({ codigo: codigo }),
    contentType: 'application/json',
    success: function(response) {
        if (response.success) {
            preencherDadosEmpresa(response.data);
            avancarParaCadastro();
        } else {
            mostrarErro(erroDiv, response.message || 'Código não encontrado.');
        }
    },
    error: function(xhr) {
        console.error('Erro na validação:', xhr);
        mostrarErro(erroDiv, 'Erro ao validar código. Tente novamente.');
    }
});
*/

  // Simulação temporária (REMOVER EM PRODUÇÃO)
  setTimeout(() => {
    const dadosSimulados = {
      codigo: codigo,
      nomeEmpresa: "Empresa Exemplo LTDA",
    };
    preencherDadosEmpresa(dadosSimulados);
    avancarParaCadastro();
  }, 800);
}

function preencherDadosEmpresa(dados) {
  $("#cpf-confirmacao").val(dados.codigo);
  $("#nome-empresa").val(dados.nomeEmpresa);
  console.log("Dados da empresa preenchidos:", dados);
}

function finalizarCadastro() {
  const erroDiv = $("#erro-cadastro");

  // Coletar dados
  const dados = {
    codigo: $("#cpf-confirmacao").val(),
    nomeEmpresa: $("#nome-empresa").val(),
    nomeUsuario: $("#nome-usuario").val().trim(),
    email: $("#email-usuario").val().trim(),
    senha: $("#senha-usuario").val(),
    senhaConfirmacao: $("#senha-confirmacao").val(),
  };

  // Validações
  const erros = validarDadosCadastro(dados);

  if (erros.length > 0) {
    mostrarErro(erroDiv, erros.join("<br>"));
    return;
  }

  console.log("Dados do cadastro:", dados);

  // AQUI VOCÊ DEVE FAZER A CHAMADA AJAX REAL
  /*
    $.ajax({
        url: '/api/cadastrar-usuario',
        method: 'POST',
        data: JSON.stringify({
            codigo: dados.codigo,
            nome: dados.nomeUsuario,
            email: dados.email,
            senha: dados.senha
        }),
        contentType: 'application/json',
        success: function(response) {
            if (response.success) {
                alert('Cadastro realizado com sucesso!');
                window.location.href = '../login.html';
            } else {
                mostrarErro(erroDiv, response.message || 'Erro ao cadastrar.');
            }
        },
        error: function(xhr) {
            console.error('Erro no cadastro:', xhr);
            mostrarErro(erroDiv, 'Erro ao realizar cadastro. Tente novamente.');
        }
    });
    */

  // Simulação temporária (REMOVER EM PRODUÇÃO)
  alert(
    "✅ Cadastro realizado com sucesso!\n\n(Simulação - integrar com backend)"
  );
  setTimeout(() => {
    window.location.href = "../login.html";
  }, 1000);
}

function validarDadosCadastro(dados) {
  const erros = [];

  if (!dados.nomeUsuario) {
    erros.push("• Nome completo é obrigatório");
  } else if (dados.nomeUsuario.length < 3) {
    erros.push("• Nome deve ter no mínimo 3 caracteres");
  }

  if (!dados.email) {
    erros.push("• E-mail é obrigatório");
  } else if (!validarEmail(dados.email)) {
    erros.push("• E-mail inválido");
  }

  if (!dados.senha) {
    erros.push("• Senha é obrigatória");
  } else if (dados.senha.length < 6) {
    erros.push("• Senha deve ter no mínimo 6 caracteres");
  }

  if (dados.senha !== dados.senhaConfirmacao) {
    erros.push("• As senhas não coincidem");
  }

  return erros;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  return regex.test(email);
}

function mostrarErro(elemento, mensagem) {
  elemento.html(mensagem).addClass("show");
  elemento[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function limparErro(elemento) {
  elemento.html("").removeClass("show");
}

function voltarParaValidacao() {
  limparFormularios();
  CadastroAnimacao.voltarParaValidacao();
}

function avancarParaCadastro() {
  limparErro($("#erro-validacao"));
  CadastroAnimacao.avancarParaCadastro();
}

function limparFormularios() {
  $("#cpf-cliente").val("");
  $("#nome-usuario").val("");
  $("#email-usuario").val("");
  $("#senha-usuario").val("");
  $("#senha-confirmacao").val("");
  limparErro($("#erro-validacao"));
  limparErro($("#erro-cadastro"));
}
