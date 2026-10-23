import type { FormEvent } from "react";
import { useFormulario } from "../../hooks/useFormulario";
import { somenteNumeros } from "../../utils/formatadores";
import Campo from "./Campo";
import CamposSenha from "./CamposSenha";
import estilos from "./FormCadastro.module.css";

interface FormProps {
    aoConcluir: () => void;
}

const inicial = {
    nome: "",
    cnpj: "",
    email: "",
    endereco: "",
    senha: "",
    confirmarSenha: "",
};

export default function FormFarmacia({ aoConcluir }: FormProps) {
    const { valores, atualizar, definir } = useFormulario(inicial);

    function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (valores.senha !== valores.confirmarSenha) {
        alert("As senhas não conferem.");
        return;
    }

    console.log("Cadastro de farmácia:", {
        ...valores,
        senha: "***",
        confirmarSenha: "***",
    });
    alert("Cadastro enviado! Sua conta ficará pendente até a aprovação de um administrador.");
    aoConcluir();
    }

    return (
    <form onSubmit={enviar}>
        <Campo id="nome" rotulo="Nome da Farmácia">
        <input id="nome" name="nome" type="text" value={valores.nome} onChange={atualizar} required />
        </Campo>

        <Campo id="cnpj" rotulo="CNPJ">
        <input
            id="cnpj"
            name="cnpj"
            type="text"
            inputMode="numeric"
            minLength={14}
            maxLength={14}
            value={valores.cnpj}
            onChange={(e) => definir("cnpj", somenteNumeros(e.target.value))}
            required
        />
        </Campo>

        <Campo id="email" rotulo="E-mail">
        <input id="email" name="email" type="email" value={valores.email} onChange={atualizar} required />
        </Campo>

        <Campo id="endereco" rotulo="Endereço Comercial">
        <input id="endereco" name="endereco" type="text" value={valores.endereco} onChange={atualizar} required />
        </Campo>

        <CamposSenha
        senha={valores.senha}
        confirmarSenha={valores.confirmarSenha}
        aoMudar={atualizar}
        />

        <button type="submit" className={estilos.botao}>
        Continuar
        </button>
    </form>
    );
}