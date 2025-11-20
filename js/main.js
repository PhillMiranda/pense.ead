$(function () {
    $('.search-wrapper i.material-icons').click(function () {
        $(this).parents('form').submit();
    });
});

// Execução de lazyload
$(document).ready(function () {
    function startListeners() {
        document.addEventListener("scroll", lazyload);
        window.addEventListener("resize", lazyload);
        window.addEventListener("orientationChange", lazyload);
        lazyload();
    }
    function removeListners() {
        document.removeEventListener("scroll", lazyload);
        window.removeEventListener("resize", lazyload);
        window.removeEventListener("orientationChange", lazyload);
    }

    function lazyload() {
        var lazyloadImages = document.querySelectorAll(".lazy");

        lazyloadImages.forEach(function (img) {
            // Distancia do topo da tela até o topo do imagem
            let distTop = img.getBoundingClientRect().top;
            img.setAttribute("style", "opacity: 0;");

            if (distTop < (window.innerHeight)) {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                $(img).fadeTo(500, 1);
            }
        });

        if (lazyloadImages.length === 0) {
            removeListners();
        }
    }
    startListeners();
});