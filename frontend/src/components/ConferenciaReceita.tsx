import type { ReactNode } from "react";
import type { ResumoReceita } from "../api/receitas";
import formulario from "../styles/Formulario.module.css";
import estilos from "./ConferenciaReceita.module.css";

const NOME_LISTA: Record<ResumoReceita["lista"], string> = {
    COMUM: "Comum",
    ANTIMICROBIANO: "Antimicrobiano",
    C1: "Controlado (C1)",
};

/** "2026-11-05" -> "05/11/2026" (sem usar Date, para não deslocar o dia por fuso). */
function formatarData(iso: string): string {
    const [ano, mes, dia] = iso.split("-");
    return `${dia}/${mes}/${ano}`;
}

function formatarCpf(cpf: string): string {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

interface ConferenciaReceitaProps {
    resumo     : ResumoReceita;
    aoVoltar   : () => void;
    children?  : ReactNode; // ações extras (no passo 3: assinar e emitir)
    assinatura?: ReactNode; // campo do arquivo .pem (e erros), vindo da tela de prescrição
}

export default function ConferenciaReceita({ resumo, aoVoltar, assinatura, children }: ConferenciaReceitaProps ) {
    const { lista, usoContinuo, dataValidade, validadePrimeiraCompra, paciente, itens } = resumo;

    const doisPrazos =
        dataValidade           !== null &&
        validadePrimeiraCompra !== null &&
        dataValidade           !== validadePrimeiraCompra;

    return (
        <div className={formulario.card}>
            <h2 className={estilos.titulo}>Confira a Prescrição</h2>
            <p className={estilos.aviso}>
                Revise com atenção. Depois de assinada e emitida, a receita não pode ser alterada.
            </p>

            <div className={estilos.etiquetas}>
                <span className={estilos.etiqueta}>{NOME_LISTA[lista]}</span>
                {usoContinuo && <span className={estilos.etiquetaSuave}>Uso contínuo</span>}
            </div>

            <section className={estilos.secao}>
                <h3>Paciente</h3>
                <dl className={estilos.dados}>
                    <dt>Nome</dt>
                    <dd>{paciente.nome}</dd>
                    <dt>CPF</dt>
                    <dd>{formatarCpf(paciente.cpf)}</dd>
                    <dt>Endereço</dt>
                    <dd>{paciente.endereco}</dd>
                </dl>
                <p className={estilos.nota}>Este endereço ficará registrado na receita.</p>
            </section>

            <section className={estilos.secao}>
                <h3>Medicamentos</h3>
                {itens.map((item) => (
                    <div key={item.medicamentoId} className={estilos.item}>
                        <p className={estilos.nomeItem}>
                            {item.nome} {item.dosagem}
                        </p>
                        <dl className={estilos.dados}>
                            <dt>Posologia</dt>
                            <dd>{item.posologia}</dd>
                            <dt>Quantidade</dt>
                            <dd>{item.quantidade}</dd>
                            <dt>Duração</dt>
                            <dd>
                                {item.duracaoDias} {item.duracaoDias === 1 ? "dia" : "dias"}
                            </dd>
                        </dl>
                    </div>
                ))}
            </section>

            <section className={estilos.secao}>
                <h3>Validade</h3>
                {doisPrazos ? (
                    <dl className={estilos.dados}>
                        <dt>Primeira compra até</dt>
                        <dd>{formatarData(validadePrimeiraCompra)}</dd>
                        <dt>Após primeira compra - Receita válida até</dt>
                        <dd>{formatarData(dataValidade)}</dd>
                    </dl>
                ) : dataValidade ? (
                    <dl className={estilos.dados}>
                        <dt>Válida até</dt>
                        <dd>{formatarData(dataValidade)}</dd>
                    </dl>
                ) : (
                    <p className={estilos.nota}>Esta Receita não tem prazo de validade.</p>
                )}
            </section>

            {assinatura && (
                <section className={estilos.secao}>
                    <h3>Assinatura Digital</h3>
                    <p className={estilos.nota}>
                        Escolha o arquivo .pem da sua chave privada. Ele é lido apenas neste
                        computador e nunca é enviado ao servidor.
                    </p>
                    <div className={estilos.slotAssinatura}>{assinatura}</div>
                </section>
            )}

            <div className={estilos.acoes}>
                <button type="button" className={estilos.voltar} onClick={aoVoltar}>
                    Voltar e Editar
                </button>
                {children}
            </div>
        </div>
    );
}