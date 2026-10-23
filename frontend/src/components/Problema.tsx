import styles from "./Problema.module.css";

const cards = [
    {
    icone: "/img/erros.png",
    titulo: "Prescrição com falhas",
    texto:
        "Ilegibilidade e ausência de informações essenciais como dosagem, via de administração e posologia são erros comuns durante a prescrição.",
    },
    {
    icone: "/img/farm.png",
    titulo: "Dispensação insegura",
    texto:
        "Receitas incompletas ou ilegíveis dificultam a conferência e podem levar a dispensações incorretas ou à negativa de venda.",
    },
    {
    icone: "/img/caps.png",
    titulo: "Automedicação",
    texto:
        "Diante das dificuldades, pacientes recorrem à automedicação, prática comum que pode causar intoxicações, reações adversas e mascarar doenças.",
    },
    {
    icone: "/img/escudo.png",
    titulo: "Consequências",
    texto:
        "Desde falhas terapêuticas até lesões graves e ações judiciais. Um problema que afeta pacientes, profissionais e todo o sistema de saúde.",
    },
];

export default function Problema() {
    return (
    <section id="problema" className={styles.problema}>
        <div className={styles.cabecalho}>
        <span className={styles.subtitulo}>O Problema</span>

        <h1 className={styles.titulo}>
            Um ciclo que gera <span>riscos,<br /> erros e consequências</span>
        </h1>

        <p className={styles.descricao}>
            Falhas na prescrição, na dispensação e no uso de medicamentos
            comprometem a segurança do paciente e impactam todo o sistema de saúde
        </p>
        </div>

        <div className={styles.cards}>
        {cards.map((card, indice) => (
            <div key={card.titulo} className={styles.card}>
            <div className={styles.numero}>
                {String(indice + 1).padStart(2, "0")}
            </div>

            <div className={styles.circulo}>
                <img src={card.icone} alt={card.titulo} />
            </div>

            <h3>{card.titulo}</h3>
            <p>{card.texto}</p>
            </div>
        ))}
        </div>
    </section>
    );
}