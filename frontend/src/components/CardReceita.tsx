import styles from "./CardReceita.module.css";

export type TipoReceita = "antibiotico" | "controlado" | "comum";

interface CardReceitaProps {
    tipo: TipoReceita;
    rotulo: string;
    nome: string;
    token: string;
}

const titulos: Record<TipoReceita, string> = {
    antibiotico: "Antibiótico",
    controlado: "Controlado",
    comum: "Comum",
};

export default function CardReceita({ tipo, rotulo, nome, token }: CardReceitaProps) {
    return (
    <div className={styles.card}>
        <div className={`${styles.faixa} ${styles[tipo]}`}></div>

        <div className={styles.corpo}>
        <h2>{titulos[tipo]}</h2>

        <div>
            <p>{rotulo}: {nome}</p>
            <p>Token: {token}</p>
        </div>

        <button className={styles.expandir}>Expandir</button>
        </div>
    </div>
    );
}