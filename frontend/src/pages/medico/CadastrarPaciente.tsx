import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ufs } from "../../data/ufs";
import { somenteNumeros } from "../../utils/formatadores";
import formulario from "../../styles/Formulario.module.css";
import styles from "./CadastrarPaciente.module.css";

interface FormPaciente {
    nome: string;
    cpf: string;
    genero: "M" | "F" | "";
    dataNascimento: string;
    endereco: string;
    numero: string;
    complemento: string;
    uf: string;
}

const formInicial: FormPaciente = {
    nome: "",
    cpf: "",
    genero: "",
    dataNascimento: "",
    endereco: "",
    numero: "",
    complemento: "",
    uf: "",
};

const hoje = new Date().toLocaleDateString("sv-SE");

export default function CadastrarPaciente() {
    const [form, setForm] = useState<FormPaciente>(formInicial);

    function atualizarCampo(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
    }

    function atualizarCpf(e: ChangeEvent<HTMLInputElement>) {
    setForm((anterior) => ({ ...anterior, cpf: somenteNumeros(e.target.value) }));
    }

    function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Paciente:", form);
    alert("Paciente cadastrado! (ainda sem back-end)");
    setForm(formInicial);
    }

    return (
    <div className={formulario.pagina}>
        <h1 className={formulario.titulo}>Novo Paciente</h1>

        <form className={formulario.card} onSubmit={enviar}>
        <div className={formulario.campo}>
            <label htmlFor="nome">Paciente</label>
            <input
            id="nome"
            name="nome"
            type="text"
            placeholder="Nome Completo"
            value={form.nome}
            onChange={atualizarCampo}
            required
            />
        </div>

        <div className={formulario.campo}>
            <label htmlFor="cpf">CPF</label>
            <input
            id="cpf"
            name="cpf"
            type="text"
            inputMode="numeric"
            placeholder="Somente números"
            maxLength={11}
            value={form.cpf}
            onChange={atualizarCpf}
            required
            />
        </div>

        <div className={formulario.linha}>
            <div className={`${formulario.grupo} ${styles.genero}`}>
            <label htmlFor="genero">Gênero</label>
            <select
                id="genero"
                name="genero"
                value={form.genero}
                onChange={atualizarCampo}
                required
            >
                <option value="" disabled>Selecionar</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
            </select>
            </div>

            <div className={`${formulario.grupo} ${styles.nascimento}`}>
            <label htmlFor="dataNascimento">Nascimento</label>
            <input
                id="dataNascimento"
                name="dataNascimento"
                type="date"
                min="1900-01-01"
                max={hoje}
                value={form.dataNascimento}
                onChange={atualizarCampo}
                required
            />
            </div>

            <div className={`${formulario.grupo} ${styles.endereco}`}>
            <label htmlFor="endereco">Endereço</label>
            <input
                id="endereco"
                name="endereco"
                type="text"
                placeholder="Rua, Avenida..."
                value={form.endereco}
                onChange={atualizarCampo}
                required
            />
            </div>
        </div>

        <div className={formulario.linha}>
            <div className={`${formulario.grupo} ${styles.numero}`}>
            <label htmlFor="numero">Número</label>
            <input
                id="numero"
                name="numero"
                type="text"
                placeholder="123"
                value={form.numero}
                onChange={atualizarCampo}
                required
            />
            </div>

            <div className={`${formulario.grupo} ${styles.complemento}`}>
            <label htmlFor="complemento">Complemento</label>
            <input
                id="complemento"
                name="complemento"
                type="text"
                placeholder="Apartamento, bloco..."
                value={form.complemento}
                onChange={atualizarCampo}
            />
            </div>

            <div className={`${formulario.grupo} ${styles.uf}`}>
            <label htmlFor="uf">UF</label>
            <select
                id="uf"
                name="uf"
                value={form.uf}
                onChange={atualizarCampo}
                required
            >
                <option value="" disabled>UF</option>
                {ufs.map((sigla) => (
                <option key={sigla} value={sigla}>
                    {sigla}
                </option>
                ))}
            </select>
            </div>
        </div>

        <button type="submit" className={formulario.botao}>
            Cadastrar Paciente
        </button>
        </form>
    </div>
    );
}