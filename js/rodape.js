document.addEventListener("DOMContentLoaded", function () {

    const footerHTML = `
    <footer class="page-footer">

        <div class="logo-placeholder">
            <a href="/" class="brand-logo">
                <img src="/img/identidade_visual/pense.ead - Logo.svg"
                    class="logo" alt="pense.ead"
                    title="pense.ead">
            </a>
        </div>

        <div class="footer-links">
            <div class="row">
                <div class="col s12 m3 student-area">
                    <li class="login">
                        
                    </li>
                    <li class="register">
                        
                    </li>
                </div>

                <div class="col s12 m6 contato">
                    <h3 class="titulo">Contato</h3>
                    <div class="links">
                        <ul>
                            <li><p>Telefone: (21) 9 8716-1707</p></li>
                            <li><p>©2024 - 2025 - Phillip Miranda - Direitos Reservados</p></li>
                        </ul>
                    </div>
                </div>

                <div class="col s12 m3 sociais">
                    <div class="links">
                        <ul class="icones-sociais">
                            <li class="facebook">
                                <a href="https://www.facebook.com/phillmiranda" target="_blank">
                                    <i class="fa fa-facebook-official" aria-hidden="true"></i>
                                </a>
                            </li>
                            <li class="instagram">
                                <a href="https://www.instagram.com/phillmiranda/" target="_blank">
                                    <i class="fa fa-instagram" aria-hidden="true"></i>
                                </a>
                            </li>
                            <li class="youtube">
                                <a href="https://www.youtube.com/@PhillMiranda" target="_blank">
                                    <i class="fa fa-youtube-play" aria-hidden="true"></i>
                                </a>
                            </li>
                            <li class="linkedin">
                                <a href="https://www.linkedin.com/in/phillip-miranda-7b09561b3/"
                                    target="_blank">
                                    <i class="fa fa-linkedin" aria-hidden="true"></i>
                                </a>
                            </li>
                            <li class="globe">
                                <a href="https://github.com/PhillMiranda" target="_blank">
                                    <i class="fa fa-github" aria-hidden="true"></i>
                                </a>
                            </li>
                        </ul>

                        <div class="col m12 s12 copyright">
                            <p>© 2025 penseead</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </footer>
    `;

    // Insere o footer no final do body
    document.body.insertAdjacentHTML("beforeend", footerHTML);

});
