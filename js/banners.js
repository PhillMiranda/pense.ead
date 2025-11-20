$(document).ready(function () {
    
    // 1. Dados dos Banners (Adicione novos objetos aqui)
    const banners = [
        {
            img: "/img/banner_principal/banner-penseead-novidades.png",
            alt: "Novidades chegando para tornar sua jornada ainda mais fácil.",
            titulo: "", // Deixe vazio se não quiser texto sobre a imagem
            texto: "",  // Deixe vazio se não quiser texto
            botaoTexto: "Acesse aqui!",
            botaoLink: "https://api.whatsapp.com/send/?phone=5521987161707&text&type=phone_number&app_absent=0"
        },
        // Exemplo de um segundo banner (pode remover ou editar)
        /*
        {
            img: "URL_DA_SUA_OUTRA_IMAGEM.jpg",
            alt: "Descrição da imagem",
            titulo: "Título do Banner 2",
            texto: "Descrição curta do banner 2",
            botaoTexto: "Saiba Mais",
            botaoLink: "/courses"
        }
        */
    ];

    // 2. Seleciona o container do slider
    const sliderContainer = $('#home-slider');

    if (sliderContainer.length) {
        let htmlContent = "";

        // 3. Gera o HTML para cada slide
        banners.forEach((banner, index) => {
            // Lógica para mostrar ou esconder o botão dependendo se tem link
            const botaoHtml = banner.botaoLink ? `
                <div class="carousel-btn hide-on-small-only">
                    <a target="_blank" class="waves-effect waves-light btn-subscription" href="${banner.botaoLink}">
                        ${banner.botaoTexto}
                    </a>
                </div>` : '';

            htmlContent += `
            <div class="carousel-item white-text" href="#slide${index}!">
                <img class="carousel-img" src="${banner.img}" alt="${banner.alt}" />
                <div class="carousel-fixed-item center">
                    <div class="carousel-infos">
                        <h2 class="carousel-title">${banner.titulo}</h2>
                        <p class="white-text carousel-text">${banner.texto}</p>
                        ${botaoHtml}
                    </div>
                </div>
            </div>`;
        });

        // 4. Injeta o HTML
        sliderContainer.html(htmlContent);

        // 5. Inicializa o Carrossel (Materialize)
        sliderContainer.carousel({
            fullWidth: true,
            indicators: true
        });

        // 6. Configura o Autoplay (muda a cada 5 segundos)
        if (banners.length > 1) {
            setInterval(function () {
                sliderContainer.carousel('next');
            }, 5000);
        }
    }
});