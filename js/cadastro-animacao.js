const CadastroAnimacao = {

    // Avançar para tela de cadastro
    avancarParaCadastro: function() {
        const validacao = $('.screen-validacao');
        const confirmacao = $('.screen-confirmacao');
    
        validacao.addClass('exit-left').removeClass('active');
    
        setTimeout(() => {
            confirmacao.addClass('active');
        }, 300);
    
        console.log('Avançando para tela de cadastro');
    },
    
    // Voltar para tela de validação
    voltarParaValidacao: function() {
        const validacao = $('.screen-validacao');
        const confirmacao = $('.screen-confirmacao');
    
        confirmacao.removeClass('active');
    
        setTimeout(() => {
            validacao.removeClass('exit-left').addClass('active');
        }, 300);
    
        console.log('Voltando para tela de validação');
    }
    };

    // Inicializar tela de validação ao carregar $(document).ready(function() { $('.screen-validacao').addClass('active'); });

