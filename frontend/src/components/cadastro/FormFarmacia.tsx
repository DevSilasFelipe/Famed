import type { FormEvent } from "react";
import { useFormulario } from "../../hooks/useFormulario";
import { somenteNumeros } from "../../utils/formatadores";
import Campo from "./Campo";
import CamposSenha from "./CamposSenha";
import estilos from "./FormCadastro.module.css";
import { useState } from "react";
import { post, ErroApi } from "../../api/api";

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
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    if (valores.senha !== valores.confirmarSenha) {
        setErro("As senhas não conferem.");
        return;
    }

    setEnviando(true);
    try {
        await post("/farmacias", {
            nome    : valores.nome,
            email   : valores.email,
            senha   : valores.senha,
            cnpj    : valores.cnpj,
            endereco: valores.endereco,
        });
        alert("Cadastro realizado!");
        aoConcluir();
    } catch (err) {
        setErro(err instanceof ErroApi ? err.message : "Erro inesperado.");
    } finally {
        setEnviando(false);
    }
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

        {erro && <p role="alert" className={estilos.erro}>{erro}</p>}
        <button type="submit" className={estilos.botao} disabled={enviando}>
            {enviando ? "Enviando..." : "Continuar"}
        </button>
    </form>
    );
}