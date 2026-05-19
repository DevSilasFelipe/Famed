//Vericar se ja existe uma sessão
verificarSessao();

function fazerLogin(event) {
    //Impede o recarregamento do form
    event.preventDefault();

    //Pegar os valores digitados no formlário
    let usuario = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    //validar usuário
    if (usuario === "admin" && senha === "123") {
        //Criar a sessao
        sessionStorage.setItem("usuarioLogado", usuario);

        //abrir pagina de sistema
        window.location.href = "../medico/inicio.html"
    } else {
        alert("usuário ou senha inválidos!")
    }
}

function verificarSessao(){
    //procurar sessao salva
    let usuario = sessionStorage.getItem("usuarioLogado");

    if(usuario){
        window.location.href = "../medico/inicio.html"
    }
};
