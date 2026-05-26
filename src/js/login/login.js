function fazerLogin(event){
    //impede reload do form
    event.preventDefault();

    //captura valores
    let usuario = document.getElementById("email").value;
    let senha   = document.getElementById("senha").value;

    //login fake temporário MÉDICO
    if (usuario === "teste@medico.com" && senha === "123"){

        //salva sessão
        sessionStorage.setItem("usuarioLogado", "true");
        sessionStorage.setItem("tipoUsuario", "medico");

        //redireciona
        window.location.replace("../medico/inicio.html");
        return;
    }

    //login fake temporário FARMÁCIA
    if(usuario === "teste@farmacia.com" && senha === "123"){

        //salva sessão
        sessionStorage.setItem("usuarioLogado", "true");
        sessionStorage.setItem("tipoUsuario", "farmacia");

        window.location.replace("../farmacia/farmacia.html");

        return
    }

    //login inválido
    alert("Usuário ou senha inválidos!");
}
