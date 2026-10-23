import type { FormEvent } from "react";
import { ufs } from "../../data/ufs";
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
    crm: "",
    ufCrm: "",
    cpf: "",
    email: "",
    endereco: "",
    senha: "",
    confirmarSenha: "",
};

export default function FormMedico({ aoConcluir }: FormProps) {
    const { valores, atualizar, definir } = useFormulario(inicial);

    function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (valores.senha !== valores.confirmarSenha) {
        alert("As senhas não conferem.");
        return;
    }

    console.log("Cadastro de médico:", {
        ...valores,
        senha: "***",
        confirmarSenha: "***",
    });
    alert("Cadastro enviado! Seu CRM será validado antes da liberação do acesso.");
    aoConcluir();
    }

    return (
    <form onSubmit={enviar}>
        <Campo id="nome" rotulo="Nome Completo">
        <input id="nome" name="nome" type="text" value={valores.nome} onChange={atualizar} required />
        </Campo>

        <div className={estilos.linha}>
        <Campo id="crm" rotulo="CRM" className={estilos.expande}>
            <input
            id="crm"
            name="crm"
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={valores.crm}
            onChange={(e) => definir("crm", somenteNumeros(e.target.value))}
            required
            />
        </Campo>

        <Campo id="ufCrm" rotulo="UF CRM" className={estilos.pequeno}>
            <select id="ufCrm" name="ufCrm" value={valores.ufCrm} onChange={atualizar} required>
            <option value="" disabled>UF</option>
            {ufs.map((sigla) => (
                <option key={sigla} value={sigla}>
                {sigla}
                </option>
            ))}
            </select>
        </Campo>
        </div>

        <Campo id="cpf" rotulo="CPF">
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

        <Campo id="email" rotulo="E-mail">
        <input id="email" name="email" type="email" value={valores.email} onChange={atualizar} required />
        </Campo>

        <Campo id="endereco" rotulo="Endereço de Atendimento">
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