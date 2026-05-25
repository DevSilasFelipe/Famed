function verificarLogin(){
    let usuarioLogado = sessionStorage.getItem("usuarioLogado");

    if(!usuarioLogado) {
        window.location.replace("../login/login.html");
    }
}

function logout(){
    sessionStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("tipoUsuario");

    window.location.replace("../login/login.html");
}