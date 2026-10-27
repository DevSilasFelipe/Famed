import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import BlocoMedicamento, { condicaoParaEnvio, duracaoDefinidaPeloSistema, itemVazio } from "../../components/BlocoMedicamento";
import type { CampoItem, ItemPrescricao } from "../../components/BlocoMedicamento";
import { buscarMedicamento, listarMedicamentos } from "../../data/medicamentos";
import type { Medicamento } from "../../data/medicamentos";
import { decimalParaNumero, somenteNumeros } from "../../utils/formatadores";
import formulario from "../../styles/Formulario.module.css";
import styles from "./Prescricao.module.css";
import { ErroApi } from "../../api/api";
import { tokenLogado } from "../../auth/sessao";
import { prepararReceita } from "../../api/receitas";
import type { CorpoReceita } from "../../api/receitas";

export default function Prescricao() {
    const [cpf, setCpf] = useState("");
    const [usoContinuo, setUsoContinuo] = useState(false);
    const [itens, setItens] = useState<ItemPrescricao[]>([itemVazio(1)]);
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);

    useEffect(() => {
        listarMedicamentos(tokenLogado() ?? undefined)
        .then(setMedicamentos)
        .catch((e) =>
            setErro(e instanceof ErroApi ? e.message : "Não foi possível carregar os medicamentos."),
    );
    }, []);

    const proximoId = useRef(1);
    const inputArquivoRef = useRef<HTMLInputElement>(null);

    function atualizarItem(idLocal: number, campo: CampoItem, valor: string) {
    setItens((anterior) =>
        anterior.map((item) =>
        item.idLocal === idLocal ? { ...item, [campo]: valor } : item,
        ),
    );
    }

    function adicionarItem() {
    proximoId.current += 1;
    setItens((anterior) => [...anterior, itemVazio(proximoId.current)]);
    }

    function removerItem(idLocal: number) {
    setItens((anterior) => anterior.filter((item) => item.idLocal !== idLocal));
    }

    function escolherArquivo(e: ChangeEvent<HTMLInputElement>) {
    const escolhido = e.target.files?.[0] ?? null;

    if (escolhido && !escolhido.name.toLowerCase().endsWith(".pem")) {
        setErro("Selecione um arquivo com a extensão .pem.");
        e.target.value = "";
        setArquivo(null);
        return;
    }

    setErro("");
    setArquivo(escolhido);
    }

    async function enviar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro("");

        const escolhidos: Medicamento[] = [];

        for (let i = 0; i < itens.length; i++) {
            const item = itens[i];
            const med  = buscarMedicamento(medicamentos, item.tipo, item.medicamento);

            if (!med) {
                setErro(`Medicamento ${i + 1}: escolha um item da lista de sugestões.`);
                return;
            }
            if (escolhidos.some((outro) => outro.id === med.id)) {
                setErro("O mesmo medicamento não pode aparecer duas vezes na mesma receita.");
                return;
            }
            if (decimalParaNumero(item.dose) <= 0) {
                setErro(`Medicamento ${i + 1}: a dose precisa ser maior que zero.`);
                return;
            }

            escolhidos.push(med);
        }

        const corpo : CorpoReceita = {
            pacienteCpf     : cpf,
            usoContinuo,
            itens           : itens.map((item, i) => ({
            medicamentoId   : escolhidos[i].id,
            dose            : decimalParaNumero(item.dose),
            intervaloValor  : Number(item.intervaloValor),
            intervaloUnidade: item.intervaloUnidade,
            duracaoDias     : duracaoDefinidaPeloSistema(usoContinuo, item.tipo)
                ? undefined
                : Number(item.duracao),
            condicaoUso: condicaoParaEnvio(item) ?? undefined,
            quantidade : escolhidos[i].quantidadeManual ? Number(item.quantidade) : undefined,
            })),
        };

        setCarregando(true);
        try {
            const resposta = await prepararReceita(corpo, tokenLogado() ?? undefined);
            console.log("Resposta do preparar:", resposta); // temporário: a conferência vem no próximo commit
        } catch (falha) {
            setErro(falha instanceof ErroApi ? falha.message : "Não foi possível revisar a prescrição.");
        } finally {
            setCarregando(false);
        }
    }

    return (
    <div className={formulario.pagina}>
        <h1 className={formulario.titulo}>Nova Prescrição</h1>

        <form className={formulario.card} onSubmit={enviar}>
        

        <div className={formulario.campo}>
            <label htmlFor="cpf">CPF do Paciente</label>
            <input
            id="cpf"
            type="text"
            inputMode="numeric"
            placeholder="Somente números"
            minLength={11}
            maxLength={11}
            value={cpf}
            onChange={(e) => setCpf(somenteNumeros(e.target.value))}
            required
            />
        </div>

        <label className={styles.usoContinuo}>
            <input
            type="checkbox"
            checked={usoContinuo}
            onChange={(e) => setUsoContinuo(e.target.checked)}
            />
            <span>
            Uso contínuo
            <small>Tratamento contínuo: o médico define quando termina.</small>
            </span>
        </label>

        {itens.map((item, indice) => (
            <BlocoMedicamento
            key={item.idLocal}
            item={item}
            numero={indice + 1}
            usoContinuo={usoContinuo}
            medicamentos={medicamentos}
            podeRemover={itens.length > 1}
            aoMudar={(campo, valor) => atualizarItem(item.idLocal, campo, valor)}
            aoRemover={() => removerItem(item.idLocal)}
            />
        ))}

        <button type="button" className={styles.adicionar} onClick={adicionarItem}>
            + Adicionar outro medicamento
        </button>

        <div className={formulario.campo}>
            <label htmlFor="assinatura">Assinatura digital</label>
            <div className={styles.assinatura}>
            <button
                id="assinatura"
                type="button"
                className={styles.escolher}
                onClick={() => inputArquivoRef.current?.click()}
            >
                Escolher arquivo (.pem)
            </button>
            <span className={styles.nomeArquivo}>
                {arquivo ? arquivo.name : "Nenhum arquivo selecionado"}
            </span>
            </div>
            <input
            ref={inputArquivoRef}
            type="file"
            accept=".pem"
            hidden
            onChange={escolherArquivo}
            />
        </div>

        {erro && (
            <p className={styles.erro} role="alert">
            {erro}
            </p>
        )}

        <button type="submit" className={formulario.botao} disabled={carregando}>
            {carregando ? "Revisando..." : "Revisar prescrição"}
        </button>
        </form>
    </div>
    );
}