import type { FormEvent } from "react";
import { useFormulario } from "../../hooks/useFormulario";
import Campo from "./Campo";
import CamposSenha from "./CamposSenha";
import estilos from "./FormCadastro.module.css";
import { somenteNumeros } from "../../utils/formatadores";
import { useState } from "react";
import { post, ErroApi } from "../../api/api";

interface FormProps {
    aoConcluir: () => void;
}

const inicial = {
    nome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "",
    email: "",
    endereco: "",
    senha: "",
    confirmarSenha: "",
};

const hoje = new Date().toLocaleDateString("sv-SE");

export default function FormPaciente({ aoConcluir }: FormProps) {
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
        await post("/pacientes", {
            nome          : valores.nome,
            email         : valores.email,
            senha         : valores.senha,
            cpf           : valores.cpf,
            dataNascimento: valores.dataNascimento,
            sexo          : valores.sexo,
            endereco      : valores.endereco,
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
        <Campo id="nome" rotulo="Nome Completo">
        <input id="nome" name="nome" type="text" value={valores.nome} onChange={atualizar} required />
        </Campo>

        <div className={estilos.linha}>
        <Campo id="cpf" rotulo="CPF" className={estilos.expande}>
            <input
            id="cpf"
            name="cpf"
            type="text"
            inputMode="numeric"
            minLength={11}
            maxLength={11}
            value={valores.cpf}
            onChange={(e) => definir("cpf", somenteNumeros(e.target.value))}
            required
            />
        </Campo>

        <Campo id="dataNascimento" rotulo="Nascimento" className={estilos.medio}>
            <input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                min="1900-01-01"
                max={hoje}
                value={valores.dataNascimento}
                onChange={atualizar}
                required
            />
        </Campo>

        <Campo id="sexo" rotulo="Sexo" className={estilos.medio}>
            <select id="sexo" name="sexo" value={valores.sexo} onChange={atualizar} required>
            <option value="" disabled>Selecionar</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            </select>
        </Campo>
        </div>

        <Campo id="email" rotulo="E-mail">
        <input id="email" name="email" type="email" value={valores.email} onChange={atualizar} required />
        </Campo>

        <Campo id="endereco" rotulo="Endereço Completo">
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