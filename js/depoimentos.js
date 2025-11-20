$(document).ready(function () {
    
    // 1. Definição dos dados (Adicione ou remova depoimentos aqui)
    const depoimentos = [
        {
            titulo: "Certificado front-end developer",
            texto: "Aprenda a desenvolver sites e aplicações web utilizando as principais linguagens e frameworks do mercado, criando projetos reais para compor seu portfólio.",
            img: "img/icones/icone_1.png"
        },
        {
            titulo: "Certificado back-end developer",
            texto: "Domine as tecnologias e ferramentas essenciais para o desenvolvimento de servidores, APIs e bancos de dados, criando soluções robustas e escaláveis para atender às demandas do mercado.",
            img: "img/icones/icone_2.png"
        },
        {
            titulo: "Certificado full stack developer",
            texto: "Torne-se um desenvolvedor completo, capaz de atuar tanto no front-end quanto no back-end. Aprenda a criar aplicações completas, integrando interfaces modernas com servidores eficientes e bancos de dados robustos.",
            img: "img/icones/icone_3.png"
        }
    ];

    // 2. Seleciona o local no HTML onde os depoimentos entrarão
    const container = document.getElementById('lista-depoimentos');

    // 3. Se o container existir, cria e injeta o HTML
    if (container) {
        let htmlContent = "";

        depoimentos.forEach(item => {
            htmlContent += `
            <div class="col s12 m4 depoimento">
                <img class="circle responsive-img lazy" data-src="${item.img}" alt="${item.titulo}">
                <h4 class="subtitulo" style="font-weight: bold;">${item.titulo}</h4>
                <hr class='hr-detalhe'>
                <p class="conteudo">${item.texto}</p>
            </div>
            `;
        });

        container.innerHTML = htmlContent;
    }
});