import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { NavbarProps } from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./Layout.module.css";

export default function Layout({ links, acao }: NavbarProps) {
    return (
    <div className={styles.layout}>
        <Navbar links={links} acao={acao} />
        <main className={styles.conteudo}>
        <Outlet />
        </main>
        <Footer />
    </div>
    );
}