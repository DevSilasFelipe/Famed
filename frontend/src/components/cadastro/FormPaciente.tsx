import type { FormEvent } from "react";
import { useFormulario } from "../../hooks/useFormulario";
import Campo from "./Campo";
import CamposSenha from "./CamposSenha";
import estilos from "./FormCadastro.module.css";
import { somenteNumeros } from "../../utils/formatadores";

interface FormProps {
    aoConcluir: () => void;
}

const inicial = {
    nome: "",
    cpf: "",
    dataNascimento: "",
    genero: "",
    email: "",
    endereco: "",
    senha: "",
    confirmarSenha: "",
};

const hoje = new Date().toLocaleDateString("sv-SE");

export default function FormPaciente({ aoConcluir }: FormProps) {
    const { valores, atualizar, definir } = useFormulario(inicial);

    function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (valores.senha !== valores.confirmarSenha) {
        alert("As senhas não conferem.");
        return;
    }

    console.log("Cadastro de paciente:", {
        ...valores,
        senha: "***",
        confirmarSenha: "***",
    });
    alert("Cadastro realizado!");
    aoConcluir();
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

        <Campo id="genero" rotulo="Gênero" className={estilos.medio}>
            <select id="genero" name="genero" value={valores.genero} onChange={atualizar} required>
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

        <button type="submit" className={estilos.botao}>
        Continuar
        </button>
    </form>
    );
}