import { Link } from "react-router-dom";
import botao from "../styles/BotaoEntrar.module.css";
import styles from "./Apresentacao.module.css";

export default function Apresentacao() {
    return (
    <section id="home" className={styles.home}>
        <div className={styles.forma}></div>

        <div className={styles.cta}>
        <h1 className={styles.titulo}>
            Prescrições Médicas <span>Digitais</span>
        </h1>

        <p className={styles.descricao}>
            Todo o ciclo de vida de uma receita médica em um só lugar, desde a
            prescrição até a dispensação!
        </p>

        <div className={styles.botoes}>
            <Link to="/login" className={`${botao.botao} ${botao.grande}`}>
            Entrar
            </Link>
        </div>
        </div>

        <div className={styles.banner}>
        <img src="/img/logoprincipal.png" alt="Logo principal da Famed" />
        </div>
    </section>
    );
}