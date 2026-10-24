import styles from "./QuemSomos.module.css";

const cards = [
    {
    titulo: "Médicos",
    texto:
        "Através da nossa plataforma, buscamos reduzir ao máximo possíveis erros durante a prescrição.",
    },
    {
    titulo: "Farmácias",
    texto:
        "Fornecemos uma plataforma intuitiva para a visualização das receitas e baixa dos medicamentos contidos na mesma.",
    },
    {
    titulo: "Pacientes",
    texto:
        "Oferecemos um app mobile onde podem ter o controle total da organização e histórico de suas receitas em um só lugar.",
    },
];

export default function QuemSomos() {
    return (
    <section id="sobre" className={styles.sobre}>
        <h1 className={styles.titulo}>Quem Somos</h1>

        <p className={styles.intro}>
        A <span>famed</span> é um ecossistema digital que integra todo o ciclo
        de vida de uma receita médica, garantindo segurança e agilidade desde a
        prescrição à dispensação.
        </p>

        <div className={styles.cards}>
        {cards.map((card) => (
            <div key={card.titulo} className={styles.card}>
            <h3>{card.titulo}</h3>
            <p>{card.texto}</p>
            </div>
        ))}
        </div>
    </section>
    );
}