import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ErroApi } from "../../api/api";
import { buscarReceitaPorToken } from "../../api/receitas";
import type { ReceitaParaFarmacia } from "../../api/receitas";
import { encerrarSessao, tokenLogado } from "../../auth/sessao";
import { formatarCpf, formatarData, formatarInstante, somenteAlfanumericos } from "../../utils/formatadores";
import styles from "./BuscarReceita.module.css";

const NOME_LISTA: Record<string, string> = {
    COMUM: "Comum",
    ANTIMICROBIANO: "Antimicrobiano",
    C1: "Controlado (C1)",
};

export default function BuscarReceita() {
    const [token, setToken] = useState("");
    const [receita, setReceita] = useState<ReceitaParaFarmacia | null>(null);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    // Só tira símbolos. Não força maiúscula: o token diferencia maiúscula de minúscula.
    function atualizarToken(e: ChangeEvent<HTMLInputElement>) {
        setToken(somenteAlfanumericos(e.target.value));
    }

    async function buscar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro("");
        setReceita(null);
        setCarregando(true);
        try {
            setReceita(await buscarReceitaPorToken(token, tokenLogado() ?? undefined));
        } catch (falha) {
            if (falha instanceof ErroApi && falha.status === 401) {
                encerrarSessao();
                alert("Sua sessão expirou. Entre novamente.");
                navigate("/login", { replace: true });
                return;
            }
            setErro(falha instanceof Error ? falha.message : "Não foi possível buscar a receita.");
        } finally {
            setCarregando(false);
        }
    }

    function novaBusca() {
        setReceita(null);
        setErro("");
        setToken("");
    }

    return (
    <div className={`${styles.pagina} ${receita ? "" : styles.centralizada}`}>
        <form className={`${styles.caixa} ${styles.naoImprimir}`} onSubmit={buscar}>
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
        <button type="submit" className={styles.seta} aria-label="Buscar receita" disabled={carregando}>
            {carregando ? "…" : "→"}
        </button>
        </form>

        {erro && (
            <p className={`${styles.mensagemErro} ${styles.naoImprimir}`} role="alert">{erro}</p>
        )}

        {receita && (
            <article className={styles.receita}>
                {receita.vencida && (
                    <p className={styles.vencida} role="alert">
                        Receita vencida{receita.dataValidade ? ` em ${formatarData(receita.dataValidade)}` : ""}.
                    </p>
                )}

                <div className={styles.cabecalho}>
                    <h1>Receita {receita.token}</h1>
                    <div className={styles.etiquetas}>
                        <span className={styles.etiqueta}>
                            {NOME_LISTA[receita.lista.codigo] ?? receita.lista.descricao}
                        </span>
                        {receita.usoContinuo && <span className={styles.etiquetaSuave}>Uso contínuo</span>}
                    </div>
                    <dl className={styles.dados}>
                        <dt>Emitida em</dt>
                        <dd>{formatarInstante(receita.emitidaEm)}</dd>
                        <dt>Validade</dt>
                        <dd>
                            {receita.dataValidade
                                ? formatarData(receita.dataValidade)
                                : "Sem prazo de validade"}
                        </dd>
                    </dl>
                </div>

                <section className={styles.secao}>
                    <h2>Profissional</h2>
                    <dl className={styles.dados}>
                        <dt>Nome</dt>
                        <dd>{receita.medico.nome}</dd>
                        <dt>CRM</dt>
                        <dd>{receita.medico.crm}-{receita.medico.uf}</dd>
                    </dl>
                </section>

                <section className={styles.secao}>
                    <h2>Paciente</h2>
                    <dl className={styles.dados}>
                        <dt>Nome</dt>
                        <dd>{receita.paciente.nome}</dd>
                        <dt>CPF</dt>
                        <dd>{formatarCpf(receita.paciente.cpf)}</dd>
                    </dl>
                </section>

                <section className={styles.secao}>
                    <h2>Medicamentos</h2>
                    {receita.itens.map((item, indice) => (
                        <div key={indice} className={styles.item}>
                            <p className={styles.nomeItem}>{item.nome} {item.dosagem}</p>
                            <dl className={styles.dados}>
                                <dt>Posologia</dt>
                                <dd>{item.posologia}</dd>
                                <dt>Quantidade prescrita</dt>
                                <dd>{item.quantidade}</dd>
                            </dl>
                        </div>
                    ))}
                </section>

                <div className={`${styles.acoes} ${styles.naoImprimir}`}>
                    <button type="button" className={styles.imprimir} onClick={() => window.print()}>
                        Imprimir
                    </button>
                    <button type="button" className={styles.novaBusca} onClick={novaBusca}>
                        Nova busca
                    </button>
                </div>
            </article>
        )}
    </div>
    );
}