function verificarLogin(tipoPermitido){
    let usuarioLogado = sessionStorage.getItem("usuarioLogado");
    let tipoUsuario   = sessionStorage.getItem("tipoUsuario");

    //sem login
    if(!usuarioLogado) {
        window.location.replace("../login/login.html");
        return;
    }

    //tipo incorreto
    if(tipoUsuario !== tipoPermitido){
        window.location.replace("../login/login.html");
    }
}

function logout(){
    sessionStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("tipoUsuario");

    window.location.replace("../login/login.html");
}

//teste
window.addEventListener("pageshow", function(event){
    const paginaAtual = window.location.pathname;
    const tipoUsuario = sessionStorage.getItem("tipoUsuario");

    //proteção médico
    if(
        paginaAtual.includes("/medico/") && 
        tipoUsuario !== "medico"
    ){
        window.location.replace("../login/login.html");
    }

    //proteção farmácia
    if(
        paginaAtual.includes("/farmacia/") && 
        tipoUsuario !== "farmacia"
    ){
        window.location.replace("../login/login.html");
    }

    //proteção paciente
    if(
        paginaAtual.includes("/paciente/") &&
        tipoUsuario !== "paciente"
    ){
        window.location.replace("../login/login.html");
    }
});