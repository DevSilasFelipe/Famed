import styles from "./CardReceita.module.css";

export type TipoReceita = "antibiotico" | "controlado" | "comum";

interface CardReceitaProps {
    tipo: TipoReceita;
    rotulo: string;
    nome: string;
    token: string;
    aoExpandir: () => void;
    abrindo: boolean;
}

const titulos: Record<TipoReceita, string> = {
    antibiotico: "Antibiótico",
    controlado: "Controlado",
    comum: "Comum",
};

export default function CardReceita({ tipo, rotulo, nome, token, aoExpandir, abrindo }: CardReceitaProps) {
    return (
    <div className={styles.card}>
        <div className={`${styles.faixa} ${styles[tipo]}`}></div>

        <div className={styles.corpo}>
        <h2>{titulos[tipo]}</h2>

        <div>
            <p>{rotulo}: {nome}</p>
            <p>Token: {token}</p>
        </div>

        <button type="button" className={styles.expandir} onClick={aoExpandir} disabled={abrindo}>
            {abrindo ? "Abrindo..." : "Expandir"}
        </button>
        </div>
    </div>
    );
}