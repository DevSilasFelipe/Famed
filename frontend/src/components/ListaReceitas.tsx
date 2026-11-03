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
    carregando: boolean;
    erro: string;
    aoExpandir: (id: number) => void;
    abrindoPdf: boolean;
    erroPdf: string;
}

export default function ListaReceitas({
    receitas, rotulo, carregando, erro, aoExpandir, abrindoPdf, erroPdf,
}: ListaReceitasProps) {
    if (carregando) {
        return (
            <div className={styles.pagina}>
                <p className={styles.mensagem}>Carregando receitas...</p>
            </div>
        );
    }

    if (erro) {
        return (
            <div className={styles.pagina}>
                <p className={`${styles.mensagem} ${styles.erro}`} role="alert">{erro}</p>
            </div>
        );
    }

    if (receitas.length === 0) {
        return (
            <div className={styles.pagina}>
                <p className={styles.mensagem}>Nenhuma receita encontrada.</p>
            </div>
        );
    }

    return (
    <div className={styles.pagina}>
        {erroPdf && (
            <p className={`${styles.mensagem} ${styles.erro}`} role="alert">{erroPdf}</p>
        )}

        <section className={styles.cards}>
        {receitas.map((receita) => (
            <CardReceita
            key={receita.id}
            tipo={receita.tipo}
            rotulo={rotulo}
            nome={receita.nome}
            token={receita.token}
            aoExpandir={() => aoExpandir(receita.id)}
            abrindo={abrindoPdf}
            />
        ))}
        </section>
    </div>
    );
}