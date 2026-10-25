import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { ufs } from "../../data/ufs";
import { somenteNumeros } from "../../utils/formatadores";
import formulario from "../../styles/Formulario.module.css";
import styles from "./CadastrarPaciente.module.css";
import { useNavigate } from "react-router-dom";
import { post, ErroApi } from "../../api/api";
import { encerrarSessao, tokenLogado } from "../../auth/sessao";

interface FormPaciente {
    nome: string;
    cpf: string;
    sexo: "M" | "F" | "";
    dataNascimento: string;
    endereco: string;
    numero: string;
    complemento: string;
    uf: string;
}

const formInicial: FormPaciente = {
    nome: "",
    cpf: "",
    sexo: "",
    dataNascimento: "",
    endereco: "",
    numero: "",
    complemento: "",
    uf: "",
};

const hoje = new Date().toLocaleDateString("sv-SE");

function montarEndereco(f: FormPaciente): string {
    const complemento = f.complemento.trim() ? `, ${f.complemento.trim()}` : "";
    return `${f.endereco.trim()}, ${f.numero.trim()}${complemento} - ${f.uf}`;
}

export default function CadastrarPaciente() {
    const [form, setForm] = useState<FormPaciente>(formInicial);
    const navigate = useNavigate();
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);

    function atualizarCampo(e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((anterior) => ({ ...anterior, [name]: value }));
    }

    function atualizarCpf(e: ChangeEvent<HTMLInputElement>) {
    setForm((anterior) => ({ ...anterior, cpf: somenteNumeros(e.target.value) }));
    }

    function expirarSessao() {
        encerrarSessao();
        alert("Sua sessão expirou. Entre novamente.");
        navigate("/login", { replace: true});
    }

    async function enviar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro("");

        const token = tokenLogado();
        if (!token) {
            expirarSessao();
            return;
        }

        setEnviando(true);
        try {
            await post(
                "/pacientes/por-medico",
                {
                    nome          : form.nome,
                    cpf           : form.cpf,
                    dataNascimento: form.dataNascimento,
                    sexo          : form.sexo,
                    endereco      : montarEndereco(form),
                },
                token,
            );
            alert("Paciente cadastrado!");
            setForm(formInicial);
        } catch (err) {
            if (err instanceof ErroApi && err.status === 401) {
                expirarSessao();
                return;
            }
            if (err instanceof ErroApi && err.status === 403) {
                setErro("Você não tem permissão para cadastrar pacientes.");
                return;
            }
            setErro(err instanceof ErroApi ? err.message : "Erro inesperado.");
        } finally {
            setEnviando(false);
        }
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
            <div className={`${formulario.grupo} ${styles.sexo}`}>
            <label htmlFor="sexo">Sexo</label>
            <select
                id="sexo"
                name="sexo"
                value={form.sexo}
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

        {erro && <p role="alert" className={styles.erro}>{erro}</p>}

        <button type="submit" className={formulario.botao} disabled={enviando}>
            {enviando ? "Enviando..." : "Cadastrar Paciente"}
        </button>
        </form>
    </div>
    );
}