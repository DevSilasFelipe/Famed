import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { TipoReceita } from "../../components/CardReceita";
import formulario from "../../styles/Formulario.module.css";
import styles from "./Prescricao.module.css";

interface FormPrescricao {
    paciente: string;
    cpf: string;
    tipoReceita: TipoReceita | "";
    medicamento: string;
    quantidade: string;
    posologia: string;
}

const formInicial: FormPrescricao = {
    paciente: "",
    cpf: "",
    tipoReceita: "",
    medicamento: "",
    quantidade: "",
    posologia: "",
};

export default function Prescricao() {
    const [form, setForm] = useState<FormPrescricao>(formInicial);

    function atualizarCampo(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm((anterior) => ({ ...anterior, [name]: value }));
    }

    function atualizarCpf(e: ChangeEvent<HTMLInputElement>) {
        const somenteNumeros = e.target.value.replace(/\D/g, "");
        setForm((anterior) => ({ ...anterior, cpf: somenteNumeros }));
    }

    function enviar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        console.log("Prescrição:", form);
        alert("Prescrição gerada! (ainda sem back-end)");
        setForm(formInicial);
    }

    return (
    <div className={formulario.pagina}>
        <h1 className={formulario.titulo}>Nova Prescrição</h1>

        <form className={formulario.card} onSubmit={enviar}>
        <div className={formulario.campo}>
            <label htmlFor="paciente">Paciente</label>
            <input
            id="paciente"
            name="paciente"
            type="text"
            placeholder="Nome Completo"
            value={form.paciente}
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
            <div className={`${formulario.grupo} ${styles.tipoReceita}`}>
            <label htmlFor="tipoReceita">Tipo da Receita</label>
            <select
                id="tipoReceita"
                name="tipoReceita"
                value={form.tipoReceita}
                onChange={atualizarCampo}
                required
            >
                <option value="" disabled>Selecionar</option>
                <option value="comum">Comum</option>
                <option value="antibiotico">Antimicrobianos</option>
                <option value="controlado">Controle Especial (C1)</option>
            </select>
            </div>

            <div className={`${formulario.grupo} ${styles.medicamento}`}>
            <label htmlFor="medicamento">Medicamento</label>
            <input
                id="medicamento"
                name="medicamento"
                type="search"
                placeholder="Buscar"
                value={form.medicamento}
                onChange={atualizarCampo}
                required
            />
            </div>

            <div className={`${formulario.grupo} ${styles.quantidade}`}>
            <label htmlFor="quantidade">Quantidade</label>
            <input
                id="quantidade"
                name="quantidade"
                type="number"
                min={1}
                value={form.quantidade}
                onChange={atualizarCampo}
                required
            />
            </div>
        </div>

        <div className={formulario.campo}>
            <label htmlFor="posologia">Posologia</label>
            <input
            id="posologia"
            name="posologia"
            type="text"
            value={form.posologia}
            onChange={atualizarCampo}
            required
            />
        </div>

        <button type="submit" className={formulario.botao}>
            Gerar prescrição
        </button>
        </form>
    </div>
    );
}