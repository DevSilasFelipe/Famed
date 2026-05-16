const hamburguer = document.getElementById('hamburguer');
const menu = document.getElementById('menu');

hamburguer.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    hamburguer.classList.toggle('active', isOpen);
    hamburguer.setAttribute('aria-expanded', isOpen);
});

//Fecha o menu ao clicar em um link
document.querySelectorAll('.nav-list a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('open');
        hamburguer.classList.remove('active');
        hamburguer.setAttribute('aria-expanded', false);
    });
});