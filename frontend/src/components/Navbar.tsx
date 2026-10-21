import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
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
        sessionStorage.removeItem("usuarioLogado");
        sessionStorage.removeItem("tipoUsuario");
        navigate("/login");
    }

    return (
    <header className={styles.navbar}>
        <div className={styles.logo}>
            <img src="/img/logo2.png" alt="Logo Famed" />
        </div>

        <nav className={styles.menu}>
            <Link to="/medico">Home</Link>
            <Link to="/medico/pacientes">Meus Pacientes</Link>
            <Link to="/medico/receitas">Minhas Receitas</Link>
        </nav>

        <div className={styles.navActions}>
        <Link to="/medico/prescricao" className={styles.btnCriar}>
            CRIAR
        </Link>

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