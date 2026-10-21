import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./MedicoLayout.module.css";

export default function MedicoLayout() {
    return (
    <div className={styles.layout}>
        <Navbar />
        <main className={styles.conteudo}>
        <Outlet />
        </main>
        <Footer />
    </div>
    );
}