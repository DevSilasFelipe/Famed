const botoes = document.querySelectorAll('.tipo-btn');
const formularios = document.querySelectorAll('.formulario');

const acoes = document.getElementById('acoes');

botoes.forEach(botao => {

    botao.addEventListener('click', () => {

        //REMOVE ACTIVE DE TODOS OS BOTÕES 
        botoes.forEach(btn => {
            btn.classList.remove('active');
        });

        //ADICIONA ACTIVE NO BOTÃO CLICADO
        botao.classList.add('active');

        //ESCONDE TODOS OS FORMULÁRIOS 
        formularios.forEach(formulario => {
            formulario.classList.add('hidden');
        });

        //PEGA O ID DO FORMULÁRIO
        const formularioAlvo = botao.dataset.form;

        //MOSTRA O FORMULÁRIO CORRETO
        document.getElementById(formularioAlvo).classList.remove('hidden');

        //MOSTRA O BOTÃO CONTINUAR
        acoes.classList.remove('hidden');
    });
});