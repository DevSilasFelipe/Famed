import { Link } from "react-router-dom";
import styles from "./Inicio.module.css";

export default function Inicio() {
    return (
    <div className={styles.pagina}>
        <div className={styles.titulo}>
        <h1>Olá, Doutor!</h1>
        <p>O que deseja fazer hoje?</p>
        </div>

        <section className={styles.cards}>
        <Link to="/medico/prescricao" className={styles.card}>
            <div className={styles.forma}></div>
            <img
            src="/img/prescricao.png"
            alt="Nova Prescrição"
            className={styles.prancheta}
            />
            <h2>Nova Prescrição</h2>
            <p>Crie uma nova Receita Digital</p>
        </Link>

        <Link to="/medico/receitas" className={styles.card}>
            <div className={styles.forma}></div>
            <img src="/img/historico.png" alt="Ver Histórico" />
            <h2>Ver Histórico</h2>
            <p>Veja suas receitas já prescritas</p>
        </Link>

        <Link to="/medico/pacientes" className={styles.card}>
            <div className={styles.forma}></div>
            <img src="/img/paciente.png" alt="Cadastrar Paciente" />
            <h2>Cadastrar Paciente</h2>
            <p>Cadastre um novo paciente</p>
        </Link>
        </section>
    </div>
    );
}