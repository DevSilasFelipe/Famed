import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";
import { encerrarSessao } from "../auth/sessao";

export interface LinkNavbar {
    to: string;
    texto: string;
}

export interface NavbarProps {
    links: LinkNavbar[];
    acao?: LinkNavbar;
}

export default function Navbar({ links, acao }: NavbarProps) {
    const [menuAberto, setMenuAberto] = useState(false);
    const areaPerfilRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
        if (
        areaPerfilRef.current &&
        !areaPerfilRef.current.contains(event.target as Node)
        ) {
        setMenuAberto(false);
        }
    }

    document.addEventListener("click", fecharAoClicarFora);
    return () => document.removeEventListener("click", fecharAoClicarFora);
    }, []);

    function sair() {
        encerrarSessao();
        navigate("/login");
    }

    return (
    <header className={styles.navbar}>
        <div className={styles.logo}>
        <img src="/img/logo2.png" alt="Logo Famed" />
        </div>

        <nav className={styles.menu}>
        {links.map((link) => (
            <Link key={link.to} to={link.to}>
            {link.texto}
            </Link>
        ))}
        </nav>

        <div className={styles.navActions}>
        {acao && (
            <Link to={acao.to} className={styles.btnCriar}>
            {acao.texto}
            </Link>
        )}

        <div className={styles.perfilArea} ref={areaPerfilRef}>
            <button
            className={styles.perfil}
            onClick={() => setMenuAberto(!menuAberto)}
            >
            <img src="/img/perfil.png" alt="Perfil" />
            </button>

            <div
            className={`${styles.menuPerfil} ${menuAberto ? styles.ativo : ""}`}
            >
            <button onClick={sair}>Sair</button>
            </div>
        </div>
        </div>
    </header>
    );
}