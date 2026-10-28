import type { ChangeEvent } from "react";
import type { TipoReceita } from "./CardReceita";
import type { Medicamento } from "../data/medicamentos";
import { buscarMedicamento, rotuloMedicamento } from "../data/medicamentos";
import { somenteDecimal, somenteNumeros } from "../utils/formatadores";
import formulario from "../styles/Formulario.module.css";
import estilos from "./BlocoMedicamento.module.css";

export interface ItemPrescricao {
    idLocal: number;
    tipo: TipoReceita | "";
    medicamento: string;
    dose: string;
    intervaloValor: string;
    intervaloUnidade: "HORAS" | "DIAS" | "SEMANAS";
    duracao: string;
    condicao: "" | "se dor" | "outra";
    condicaoOutra: string;
    quantidade: string;
}

export type CampoItem = Exclude<keyof ItemPrescricao, "idLocal">;

export function itemVazio(idLocal: number): ItemPrescricao {
    return {
    idLocal,
    tipo: "",
    medicamento: "",
    dose: "",
    intervaloValor: "",
    intervaloUnidade: "HORAS",
    duracao: "",
    condicao: "",
    condicaoOutra: "",
    quantidade: "",
    };
}

export function duracaoDefinidaPeloSistema(
    usoContinuo: boolean,
    tipo: ItemPrescricao["tipo"],
): boolean {
    return usoContinuo && tipo !== "";
}

export function condicaoParaEnvio(item: ItemPrescricao): string | null {
    if (item.condicao === "") return null;
    if (item.condicao === "outra") return item.condicaoOutra.trim();
    return item.condicao;
}

interface BlocoMedicamentoProps {
    item: ItemPrescricao;
    numero: number;
    usoContinuo: boolean;
    medicamentos: Medicamento[],
    podeRemover: boolean;
    aoMudar: (campo: CampoItem, valor: string) => void;
    aoRemover: () => void;
}

const padraoInteiro = "[1-9][0-9]*";

export default function BlocoMedicamento({
    item,
    numero,
    usoContinuo,
    medicamentos,
    podeRemover,
    aoMudar,
    aoRemover,
}: BlocoMedicamentoProps) {
    const med = buscarMedicamento(medicamentos, item.tipo, item.medicamento);
    const duracaoBloqueada = duracaoDefinidaPeloSistema(usoContinuo, item.tipo);
    const opcoes = medicamentos.filter((m) => m.tipo === item.tipo);

  // Cada bloco precisa de ids próprios, senão os rótulos se confundem
    const id = (nome: string) => `${nome}-${item.idLocal}`;

    function mudar(campo: CampoItem) {
    return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        aoMudar(campo, e.target.value);
    }

    function mudarTipo(e: ChangeEvent<HTMLSelectElement>) {
    aoMudar("tipo", e.target.value);
    aoMudar("medicamento", ""); // o medicamento escolhido antes não vale mais
    }

    return (
    <section className={estilos.bloco}>
        <div className={estilos.cabecalho}>
        <h2>Medicamento {numero}</h2>
        {podeRemover && (
            <button type="button" className={estilos.remover} onClick={aoRemover}>
            Remover
            </button>
        )}
        </div>

        <div className={formulario.linha}>
        <div className={`${formulario.grupo} ${estilos.expande}`}>
            <label htmlFor={id("tipo")}>Tipo da Receita</label>
            <select id={id("tipo")} value={item.tipo} onChange={mudarTipo} required>
            <option value="" disabled>Selecionar</option>
            <option value="comum">Comum</option>
            <option value="antibiotico">Antimicrobianos</option>
            <option value="controlado">Controle Especial (C1)</option>
            </select>
        </div>

        <div className={`${formulario.grupo} ${estilos.expande}`}>
            <label htmlFor={id("medicamento")}>Medicamento</label>
            <input
            id={id("medicamento")}
            list={id("lista")}
            type="text"
            autoComplete="off"
            placeholder={item.tipo ? "Buscar" : "Escolha o tipo primeiro"}
            disabled={!item.tipo}
            value={item.medicamento}
            onChange={mudar("medicamento")}
            required
            />
            <datalist id={id("lista")}>
            {opcoes.map((m) => (
                <option key={m.id} value={rotuloMedicamento(m)} />
            ))}
            </datalist>
        </div>
        </div>

        <div className={formulario.campo}>
        <label htmlFor={id("dose")}>Dose</label>
        <div className={estilos.doseLinha}>
            <input
            id={id("dose")}
            className={estilos.doseCampo}
            type="text"
            inputMode="decimal"
            placeholder="Ex.: 2 ou 0,5"
            maxLength={7}
            pattern="[0-9]+(,[0-9]{1,2})?"
            title="Use números, com até 2 casas decimais (ex.: 0,5)"
            value={item.dose}
            onChange={(e) => aoMudar("dose", somenteDecimal(e.target.value))}
            required
            />
            <output className={estilos.saida} aria-label="Unidade da dose">
            {med ? med.unidadeDose : "unidade"}
            </output>
        </div>
        </div>

        <fieldset className={estilos.secao}>
        <legend>Intervalo entre as doses</legend>
        <div className={estilos.intervalo}>
            <span>a cada</span>
            <input
            className={estilos.intervaloNumero}
            type="text"
            inputMode="numeric"
            placeholder="Ex.: 8"
            aria-label="Intervalo entre as doses"
            pattern={padraoInteiro}
            title="Digite um número inteiro maior que zero"
            value={item.intervaloValor}
            onChange={(e) => aoMudar("intervaloValor", somenteNumeros(e.target.value))}
            required
            />
            <select
            className={estilos.intervaloUnidade}
            aria-label="Unidade do intervalo"
            value={item.intervaloUnidade}
            onChange={mudar("intervaloUnidade")}
            >
            <option value="HORAS">hora(s)</option>
            <option value="DIAS">dia(s)</option>
            <option value="SEMANAS">semana(s)</option>
            </select>
        </div>
        </fieldset>

        <div className={formulario.linha}>
        <div className={`${formulario.grupo} ${estilos.expande}`}>
            <label htmlFor={id("duracao")}>
                Duração ({item.intervaloUnidade === "SEMANAS" ? "semanas" : "dias"})
            </label>
            <input
            id={id("duracao")}
            type="text"
            inputMode="numeric"
            placeholder={duracaoBloqueada ? "Definida pelo sistema" : "Ex.: 3"}
            pattern={padraoInteiro}
            title="Digite um número inteiro maior que zero"
            disabled={duracaoBloqueada}
            value={duracaoBloqueada ? "" : item.duracao}
            onChange={(e) => aoMudar("duracao", somenteNumeros(e.target.value))}
            required={!duracaoBloqueada}
            />
        </div>

        <div className={`${formulario.grupo} ${estilos.expande}`}>
            <label htmlFor={id("condicao")}>Condições de uso</label>
            <select
            id={id("condicao")}
            value={item.condicao}
            onChange={mudar("condicao")}
            >
            <option value="">Nenhuma</option>
            <option value="se dor">se dor</option>
            <option value="outra">Outra...</option>
            </select>
        </div>
        </div>

        {item.condicao === "outra" && (
        <div className={formulario.campo}>
            <label htmlFor={id("condicaoOutra")}>Qual condição?</label>
            <input
            id={id("condicaoOutra")}
            type="text"
            maxLength={60}
            placeholder="Ex.: se febre"
            value={item.condicaoOutra}
            onChange={mudar("condicaoOutra")}
            required
            />
        </div>
        )}

        <div className={formulario.campo}>
        {med?.quantidadeManual ? (
            <>
            <label htmlFor={id("quantidade")}>Quantidade de frascos</label>
            <input
            id={id("quantidade")}
            type="text"
            inputMode="numeric"
            pattern={padraoInteiro}
            title="Digite um número inteiro maior que zero"
            value={item.quantidade}
            onChange={(e) => aoMudar("quantidade", somenteNumeros(e.target.value))}
            required
            />
            </>
        ) : (
            <>
            <label htmlFor={id("quantidade")}>Quantidade total</label>
            <output id={id("quantidade")} className={estilos.saida}>
            Calculada automaticamente
            </output>
            </>
        )}
        </div>
    </section>
    );
}