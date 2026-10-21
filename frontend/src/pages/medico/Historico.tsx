import CardReceita from "../../components/CardReceita";
import type { TipoReceita } from "../../components/CardReceita";
import styles from "./Historico.module.css";

interface Receita {
    id: number;
    tipo: TipoReceita;
    paciente: string;
    token: string;
}

const receitas: Receita[] = [
    { id: 1, tipo: "antibiotico", paciente: "Maria Souza", token: "A1B2C3" },
    { id: 2, tipo: "controlado", paciente: "João Pereira", token: "D4E5F6" },
    { id: 3, tipo: "comum", paciente: "Ana Lima", token: "G7H8I9" },
];

export default function Historico() {
    return (
    <div className={styles.pagina}>
        <section className={styles.cards}>
        {receitas.map((receita) => (
            <CardReceita
            key={receita.id}
            tipo={receita.tipo}
            rotulo="Paciente"
            nome={receita.paciente}
            token={receita.token}
            />
        ))}
        </section>
    </div>
    );
}