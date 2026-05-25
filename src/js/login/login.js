function fazerLogin(event){
    //impede reload do form
    event.preventDefault();

    //captura valores
    let usuario = document.getElementById("email").value;
    let senha   = document.getElementById("senha").value;

    //login fake temporário
    if (usuario === "teste@medico.com" && senha === "123"){

        //salva sessão
        sessionStorage.setItem("usuarioLogado", "true");
        sessionStorage.setItem("tipoUsuario", "medico");

        //redireciona
        window.location.replace("../medico/inicio.html");
    } else{
        alert("Usuário ou senha inválidos!");
    }
}
