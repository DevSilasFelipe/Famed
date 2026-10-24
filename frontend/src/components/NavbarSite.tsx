import { useState } from "react";
import { Link } from "react-router-dom";
import botao from "../styles/BotaoEntrar.module.css";
import styles from "./NavbarSite.module.css";

export default function NavbarSite() {
    const [menuAberto, setMenuAberto] = useState(false);

    function fecharMenu() {
        setMenuAberto(false);
    }
    
    return (
        <header>
            <nav className={styles.navbar}>
                <a className={styles.logoLink} href="#home" onClick={fecharMenu}>
                    <img className={styles.logo} src="/img/logoprincipal2.png" alt="Famed" />
                </a>

                <button
                className={`${styles.hamburguer} ${menuAberto ? styles.ativo : ""}`}
                aria-label="Abrir menu"
                aria-expanded={menuAberto}
                onClick={() => setMenuAberto(!menuAberto)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className={`${styles.menu} ${menuAberto ? styles.aberto : ""}`}>
                    <ul className={styles.lista}>
                        <li><a href="#sobre" onClick={fecharMenu}>Quem Somos</a></li>
                        <li><a href="#problema" onClick={fecharMenu}>O Problema</a></li>
                        <li><a href="#" onClick={fecharMenu}>Nossa Solução</a></li>
                    </ul>

                    <div className={styles.botoes}>
                        <Link to="/login" className={botao.botao}>
                            Entrar
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    )
}