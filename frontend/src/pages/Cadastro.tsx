import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormFarmacia from "../components/cadastro/FormFarmacia";
import FormMedico from "../components/cadastro/FormMedico";
import FormPaciente from "../components/cadastro/FormPaciente";
import styles from "./Cadastro.module.css";

type TipoConta = "paciente" | "medico" | "farmacia";

const tipos: { valor: TipoConta; texto: string }[] = [
    { valor: "paciente", texto: "Paciente" },
    { valor: "medico", texto: "Médico" },
    { valor: "farmacia", texto: "Farmácia" },
];

export default function Cadastro() {
    const [tipo, setTipo] = useState<TipoConta | null>(null);
    const navigate = useNavigate();

    function concluir() {
    navigate("/login");
    }

    return (
    <main className={styles.pagina}>
        <section className={styles.caixa}>
        <img
            src="/img/logoprincipalmenor.png"
            alt="Logo Famed"
            className={styles.logo}
        />

        <div className={styles.tipoConta}>
            <p>Selecione o tipo de conta</p>

            <div className={styles.tipoBotoes}>
            {tipos.map((item) => (
                <button
                key={item.valor}
                type="button"
                aria-pressed={tipo === item.valor}
                className={`${styles.tipoBtn} ${tipo === item.valor ? styles.ativo : ""}`}
                onClick={() => setTipo(item.valor)}
                >
                {item.texto}
                </button>
            ))}
            </div>
        </div>

        <div className={styles.formulario}>
            {tipo === "paciente" && <FormPaciente aoConcluir={concluir} />}
            {tipo === "medico" && <FormMedico aoConcluir={concluir} />}
            {tipo === "farmacia" && <FormFarmacia aoConcluir={concluir} />}
        </div>

        <p className={styles.rodape}>
            Já tem conta? <Link to="/login">Entrar</Link>
        </p>
        </section>
    </main>
    );
}