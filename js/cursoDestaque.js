$(document).ready(function () {
    
    // 1. Dados dos Cursos
    const cursos = [
        {
            titulo: "Lógica de Programação: Fundamentos Essenciais",
            slug: "logica-de-programacao-fundamentos-essenciais",
            img: "img/banner_curso/Banner - penseead_1.png",
            desc: "Domine os pilares do pensamento computacional. Este curso é o ponto de partida ideal para quem deseja aprender a programar, ensinando a estruturar soluções, algoritmos e o raciocínio fundamental por trás de qualquer linguagem de programação.",
            precoDe: "440,00",
            precoPor: "280,00",
            parcelas: "12",
            valorParcela: "23,33"
        },
        {
            titulo: "Front-end com React: Desenvolvendo Aplicações Modernas",
            slug: "front-end-com-react-desenvolvendo-aplicacoes-modernas",
            img: "img/banner_curso/Banner - penseead_2.png",
            desc: "Construa interfaces de usuário dinâmicas e de alto desempenho com a biblioteca mais popular do mercado. Aprenda React, Hooks, gerenciamento de estado e crie Single Page Applications (SPAs) modernas do zero.",
            precoDe: "440,00",
            precoPor: "280,00",
            parcelas: "12",
            valorParcela: "23,33"
        },
        {
            titulo: "Back-end com Node.js: Construindo APIs RESTful",
            slug: "back-end-com-nodejs-construindo-apis-restful",
            img: "img/banner_curso/Banner - penseead_3.png",
            desc: "Mergulhe no desenvolvimento back-end e aprenda a construir serviços robustos e escaláveis. Domine Node.js, Express e crie APIs RESTful seguras e eficientes para alimentar qualquer aplicação front-end.",
            precoDe: "440,00",
            precoPor: "280,00",
            parcelas: "12",
            valorParcela: "23,33"
        },
        {
            titulo: "JavaScript: Criando um gerador de senhas",
            slug: "javascript-criando-um-gerador-de-senhas",
            img: "img/banner_curso/Banner - penseead_4.png",
            desc: "Um projeto prático e focado para solidificar seus conhecimentos em JavaScript. Aprenda manipulação do DOM, funções e lógica para desenvolver uma ferramenta funcional e essencial de segurança digital.",
            precoDe: "179,90",
            precoPor: "109,90",
            parcelas: "12",
            valorParcela: "9,16"
        },
        {
            titulo: "TypeScript: Introdução e Boas Práticas",
            slug: "typescript-introducao-e-boas-praticas",
            img: "img/banner_curso/Banner - penseead_5.png",
            desc: "Eleve a qualidade do seu código JavaScript com tipagem estática. Este curso introduz o TypeScript, mostrando como ele pode prevenir erros em tempo de desenvolvimento, melhorar a manutenibilidade e facilitar a colaboração em projetos grandes.",
            precoDe: "499,90",
            precoPor: "394,90",
            parcelas: "12",
            valorParcela: "32,91"
        },
        {
            titulo: "Minicurso Programando do Zero!",
            slug: "minicurso-programando-do-zero",
            img: "img/banner_curso/Banner - penseead_6.png",
            desc: "Dê seus primeiros passos no universo da programação sem complicação. Este minicurso intensivo fornece uma visão rápida e prática sobre o que é codificar e como começar a transformar ideias em realidade digital.",
            precoDe: "300,00",
            precoPor: "288,89",
            parcelas: "12",
            valorParcela: "24,07"
        }
    ];

    // 2. Seleciona o container
    const container = document.getElementById('lista-cursos');

    if (container) {
        let htmlContent = "";

        // 3. Gera o HTML
        cursos.forEach(curso => {
            // Cria o JSON de rastreamento dinamicamente
            const trackingData = JSON.stringify({
                course: { slug: curso.slug, title: curso.titulo },
                location: "course"
            });

            htmlContent += `
            <div class="col s12 m6 l4 course">
                <div class="card gtm-event z-depth-3">
                    <div class="image-wrapper card-image">
                        <a href="/courses/${curso.slug}">
                            <img class="lazy" data-src="${curso.img}" alt="${curso.titulo}">
                        </a>
                    </div>
                    <div class="card-content">
                        <h4 class="title card-title titulo-curso left-align">${curso.titulo}</h4>
                        <p>${curso.desc}</p>
                    </div>

                    <div class="card-action">
                        <div class="price-container preco-inteiro">
                            <p class="preco-antigo">R$ ${curso.precoDe}</p>
                            <p class="preco-curso raw">R$ ${curso.precoPor}</p>
                            <a href="/courses/${curso.slug}" class="saiba-mais-sem-parcela" 
                               data-event-name="course_image" data-event-data='${trackingData}'>
                               Saiba mais <i class="fa fa-arrow-right"></i>
                            </a>
                        </div>

                        <div class="price-container preco-parcelado">
                            <p class="preco-antigo">R$ ${curso.precoDe}</p>
                            <p class="preco-curso raw">
                                ${curso.parcelas}<small>x de</small> R$ ${curso.valorParcela}
                                <small>ou</small> R$ ${curso.precoPor} <small>à vista</small>
                            </p>
                            <a href="/courses/${curso.slug}" class="" 
                               data-event-name="course_image" data-event-data='${trackingData}'>
                               Saiba mais <i class="fa fa-arrow-right"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>`;
        });

        // 4. Injeta no HTML
        container.innerHTML = htmlContent;
    }
});