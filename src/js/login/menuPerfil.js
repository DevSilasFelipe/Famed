function iniciarMenuPerfil(){
    const btnPerfil  = document.getElementById("btnPerfil");
    const menuPerfil = document.getElementById("menuPerfil");

    //segurança caso a página não tenha perfil
    if (!btnPerfil || !menuPerfil){
        return;
    }

    //abrir / fechar menu   
    btnPerfil.addEventListener("click", (event) => {
        event.stopPropagation();
        menuPerfil.classList.toggle("ativo");
    });

    //fechar clicando fora
    document.addEventListener("click", (event) => {

        if(
            !btnPerfil.contains(event.target) && 
            !menuPerfil.contains(event.target)
        ) {
            menuPerfil.classList.remove("ativo");
        }
    });
}