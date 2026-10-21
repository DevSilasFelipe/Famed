import CardReceita from "./CardReceita";
import type { TipoReceita } from "./CardReceita";
import styles from "./ListaReceitas.module.css";

export interface ReceitaResumo {
    id: number;
    tipo: TipoReceita;
    nome: string;
    token: string;
}

interface ListaReceitasProps {
    receitas: ReceitaResumo[];
    rotulo: string;
}

export default function ListaReceitas({ receitas, rotulo }: ListaReceitasProps) {
    return (
    <div className={styles.pagina}>
        <section className={styles.cards}>
        {receitas.map((receita) => (
            <CardReceita
            key={receita.id}
            tipo={receita.tipo}
            rotulo={rotulo}
            nome={receita.nome}
            token={receita.token}
            />
        ))}
        </section>
    </div>
    );
}