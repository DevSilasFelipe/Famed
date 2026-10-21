import styles from "./Footer.module.css";

export default function Footer() {
    return (
    <footer className={styles.footer}>
        <img src="/img/logobranca.png" alt="Logo Famed Branca" />

        <div className={styles.footerLinks}>
        <a href="#">Ajuda</a>
        <a href="#">Termos de Uso</a>
        <a href="#">Política de Privacidade</a>
        </div>
    </footer>
    );
}