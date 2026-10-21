import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { somenteAlfanumericos } from "../../utils/formatadores";
import styles from "./BuscarReceita.module.css";

export default function BuscarReceita() {
    const [token, setToken] = useState("");

    function atualizarToken(e: ChangeEvent<HTMLInputElement>) {
    setToken(somenteAlfanumericos(e.target.value));
    }

    function buscar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Buscar receita com token:", token);
    alert(`Buscando a receita ${token}... (ainda sem back-end)`);
    }

    return (
    <div className={styles.pagina}>
        <form className={styles.caixa} onSubmit={buscar}>
        <input
            className={styles.campo}
            type="text"
            placeholder="Digite o token da receita"
            aria-label="Token da receita"
            minLength={6}
            maxLength={6}
            value={token}
            onChange={atualizarToken}
            autoFocus
            required
        />
        <button type="submit" className={styles.seta} aria-label="Buscar receita">
            →
        </button>
        </form>
    </div>
    );
}