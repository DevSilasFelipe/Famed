import { listarMeusPacientes } from "../../api/medico";
import { useCarregamento } from "../../hooks/useCarregamento";
import { formatarCpf, formatarInstante } from "../../utils/formatadores";
import formulario from "../../styles/Formulario.module.css";
import styles from "./MeusPacientes.module.css";

export default function MeusPacientes() {
    const { dados, carregando, erro } = useCarregamento(listarMeusPacientes);

    return (
        <div className={formulario.pagina}>
            <h1 className={formulario.titulo}>Meus Pacientes</h1>

            {carregando && <p className={styles.mensagem}>Carregando pacientes...</p>}

            {!carregando && erro && (
                <p className={`${styles.mensagem} ${styles.erro}`} role="alert">{erro}</p>
            )}

            {!carregando && !erro && dados.length === 0 && (
                <p className={styles.mensagem}>
                    Você ainda não emitiu receitas para nenhum paciente.
                </p>
            )}

            <section className={styles.cards}>
                {dados.map((paciente) => (
                    <article key={paciente.pacienteId} className={styles.card}>
                        <h2>{paciente.pacienteNome}</h2>
                        <dl>
                            <div>
                                <dt>CPF</dt>
                                <dd>{formatarCpf(paciente.cpf)}</dd>
                            </div>
                            <div>
                                <dt>Idade</dt>
                                <dd>{paciente.idade} anos</dd>
                            </div>
                            {paciente.telefone && (
                                <div>
                                    <dt>Telefone</dt>
                                    <dd>{paciente.telefone}</dd>
                                </div>
                            )}
                            <div>
                                <dt>Receitas</dt>
                                <dd>{paciente.totalReceitas}</dd>
                            </div>
                            <div>
                                <dt>Última receita</dt>
                                <dd>{formatarInstante(paciente.ultimaReceitaEm)}</dd>
                            </div>
                        </dl>
                    </article>
                ))}
            </section>
        </div>
    );
}