$(document).ready(function () {
  // 1. Base de dados dos Cursos (Mantive seus dados)
  const todosOsCursos = [
    {
      titulo: "Lógica de Programação: Fundamentos Essenciais",
      slug: "logica-de-programacao-fundamentos-essenciais",
      img: "/img/banner_curso/Banner - penseead_1.png",
      desc: "Domine os pilares do pensamento computacional. Este curso é o ponto de partida ideal para quem deseja aprender a programar.",
      precoDe: "440,00",
      precoPor: "280,00",
      parcelas: "12",
      valorParcela: "23,33",
      categoria: "programacao",
    },
    {
      titulo: "Front-end com React: Desenvolvendo Aplicações Modernas",
      slug: "front-end-com-react-desenvolvendo-aplicacoes-modernas",
      img: "/img/banner_curso/Banner - penseead_2.png",
      desc: "Construa interfaces de usuário dinâmicas e de alto desempenho com a biblioteca mais popular do mercado.",
      precoDe: "440,00",
      precoPor: "280,00",
      parcelas: "12",
      valorParcela: "23,33",
      categoria: "programacao",
    },
    {
      titulo: "Back-end com Node.js: Construindo APIs RESTful",
      slug: "back-end-com-nodejs-construindo-apis-restful",
      img: "/img/banner_curso/Banner - penseead_3.png",
      desc: "Mergulhe no desenvolvimento back-end e aprenda a construir serviços robustos e escaláveis.",
      precoDe: "440,00",
      precoPor: "280,00",
      parcelas: "12",
      valorParcela: "23,33",
      categoria: "programacao",
    },
    {
      titulo: "JavaScript: Criando um gerador de senhas",
      slug: "javascript-criando-um-gerador-de-senhas",
      img: "/img/banner_curso/Banner - penseead_4.png",
      desc: "Um projeto prático e focado para solidificar seus conhecimentos em JavaScript.",
      precoDe: "179,90",
      precoPor: "109,90",
      parcelas: "12",
      valorParcela: "9,16",
      categoria: "programacao",
    },
    {
      titulo: "TypeScript: Introdução e Boas Práticas",
      slug: "typescript-introducao-e-boas-praticas",
      img: "/img/banner_curso/Banner - penseead_5.png",
      desc: "Eleve a qualidade do seu código JavaScript com tipagem estática e melhore a manutenibilidade.",
      precoDe: "499,90",
      precoPor: "394,90",
      parcelas: "12",
      valorParcela: "32,91",
      categoria: ["programacao", "combos-promocionais"],
    },
    {
      titulo: "Minicurso Programando do Zero!",
      slug: "minicurso-programando-do-zero",
      img: "/img/banner_curso/Banner - penseead_6.png",
      desc: "Dê seus primeiros passos no universo da programação sem complicação.",
      precoDe: "300,00",
      precoPor: "288,89",
      parcelas: "12",
      valorParcela: "24,07",
      categoria: "programacao" || "combos-promocionais",
    },
    {
      titulo: "Gestão do tempo: Produtividade e Alta Performance",
      slug: "gestao-do-tempo-produtividade-e-alta-performance",
      categoria: ["desenvolvimento-profissional", "combos-promocionais"],
      img: "/img/banner_curso/Banner - penseead_7.png",
      desc: "Aprenda a gerenciar seu tempo de forma eficaz para aumentar sua produtividade.",
      precoDe: "350,00",
      precoPor: "300,00",
      parcelas: "12",
      valorParcela: "25,00",
    },
  ];

  const container = document.getElementById("grid-cursos");

  // 2. Função para Desenhar os Cursos na Tela
  function renderizarCursos(lista) {
    if (!container) return;

    // Limpa o container antes de adicionar novos itens
    container.innerHTML = "";

    // Verifica se a lista está vazia (Nenhum resultado)
    if (lista.length === 0) {
      container.innerHTML = `
                <div class="col s12 center-align" style="padding: 50px 0;">
                    <i class="material-icons grey-text text-lighten-1" style="font-size: 64px;">search_off</i>
                    <h5 class="grey-text text-darken-1">Nenhum curso encontrado.</h5>
                    <p class="grey-text">Tente buscar por outro termo ou verifique a ortografia.</p>
                    <br>
                    <button class="btn waves-effect waves-light btn-resetar">Ver todos os cursos</button>
                </div>
            `;

      // Adiciona ação ao botão de resetar que acabou de ser criado
      $(".btn-resetar").click(function (e) {
        e.preventDefault();
        $("#campo-busca").val(""); // Limpa o input
        renderizarCursos(todosOsCursos); // Mostra tudo de novo
      });

      return;
    }

    let htmlContent = "";

    lista.forEach((item) => {
      // Garante que o tipo tenha um valor padrão caso venha vazio
      const tipoItem = item.tipo || "courses";

      const trackingData = JSON.stringify({
        course: { slug: item.slug, title: item.titulo },
        location: "course_list",
      });

      const linkUrl = `/${tipoItem}/${item.slug}`;

      htmlContent += `
            <div class="col s12 m6 l4 course">
                <div class="card gtm-event z-depth-3">
                    <div class="image-wrapper card-image">
                        <a href="${linkUrl}">
                            <img class="lazy" data-src="${item.img}" src="${item.img}" alt="${item.titulo}">
                        </a>
                    </div>
                    <div class="card-content">
                        <h4 class="title card-title titulo-curso left-align">${item.titulo}</h4>
                        <p>${item.desc}</p>
                    </div>

                    <div class="card-action">
                        <div class="price-container preco-inteiro">
                            <p class="preco-antigo">R$ ${item.precoDe}</p>
                            <p class="preco-curso raw">R$ ${item.precoPor}</p>
                            <a href="${linkUrl}" class="saiba-mais-sem-parcela" 
                               data-event-name="course_image" data-event-data='${trackingData}'>
                               Saiba mais <i class="fa fa-arrow-right"></i>
                            </a>
                        </div>

                        <div class="price-container preco-parcelado">
                            <p class="preco-antigo">R$ ${item.precoDe}</p>
                            <p class="preco-curso raw">
                                ${item.parcelas}<small>x de</small> R$ ${item.valorParcela}
                                <small>ou</small> R$ ${item.precoPor} <small>À vista</small>
                            </p>
                            <a href="${linkUrl}" class="" 
                               data-event-name="course_image" data-event-data='${trackingData}'>
                               Saiba mais <i class="fa fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
    });

    container.innerHTML = htmlContent;

    // Reativa o LazyLoad se necessário (se houver script externo controlando isso)
    // Mas adicionei src="${item.img}" na tag img acima para garantir que apareça mesmo se o lazy falhar na busca
  }

  // 3. Inicialização: Carrega todos os cursos ao entrar na página
  renderizarCursos(todosOsCursos);

  // 4. Lógica de Busca (Intercepta o envio do formulário)
  $("#form-busca").on("submit", function (e) {
    e.preventDefault(); // Impede a página de recarregar

    const termoBusca = $("#campo-busca").val().toLowerCase().trim();

    if (termoBusca === "") {
      // Se vazio, mostra tudo
      renderizarCursos(todosOsCursos);
    } else {
      // Filtra os cursos
      const cursosFiltrados = todosOsCursos.filter((curso) => {
        const titulo = curso.titulo.toLowerCase();
        const desc = curso.desc.toLowerCase();
        // Verifica se o termo digitado está no título OU na descrição
        return titulo.includes(termoBusca) || desc.includes(termoBusca);
      });

      renderizarCursos(cursosFiltrados);
    }
  });

  // 5. Filtro por Categorias
  $("#list-categories .collection-item").on("click", function (e) {
    e.preventDefault();

    // Marca visual
    $("#list-categories .collection-item").removeClass("active");
    $(this).addClass("active");

    const categoria = $(this).attr("href").replace("#/", "");

    if (categoria === "" || categoria === "todas") {
      renderizarCursos(todosOsCursos);
      return;
    }

    const cursosFiltrados = todosOsCursos.filter(curso => {
        if (Array.isArray(curso.categoria)) {
            return curso.categoria.includes(categoria);
        }
        return curso.categoria === categoria;
    });

    renderizarCursos(cursosFiltrados);
  });

  // (Opcional) Busca em tempo real enquanto digita
  /*
    $('#campo-busca').on('keyup', function () {
        $('#form-busca').submit();
    });
    */
});
