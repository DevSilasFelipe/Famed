import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import BlocoMedicamento, { condicaoParaEnvio, duracaoDefinidaPeloSistema, itemVazio } from "../../components/BlocoMedicamento";
import type { CampoItem, ItemPrescricao } from "../../components/BlocoMedicamento";
import { buscarMedicamento } from "../../data/medicamentos";
import type { Medicamento } from "../../data/medicamentos";
import { decimalParaNumero, somenteNumeros } from "../../utils/formatadores";
import formulario from "../../styles/Formulario.module.css";
import styles from "./Prescricao.module.css";

export default function Prescricao() {
    const [paciente, setPaciente] = useState("");
    const [cpf, setCpf] = useState("");
    const [usoContinuo, setUsoContinuo] = useState(false);
    const [itens, setItens] = useState<ItemPrescricao[]>([itemVazio(1)]);
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [erro, setErro] = useState("");

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

    function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");

    const escolhidos: Medicamento[] = [];

    for (let i = 0; i < itens.length; i++) {
        const item = itens[i];
        const med = buscarMedicamento(item.tipo, item.medicamento);

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

    if (!arquivo) {
        setErro("Selecione o arquivo de assinatura (.pem).");
        return;
    }

    const dados = {
        cpfPaciente: cpf,
        usoContinuo,
        itens: itens.map((item, i) => ({
        medicamentoId: escolhidos[i].id,
        dose: decimalParaNumero(item.dose),
        intervaloValor: Number(item.intervaloValor),
        intervaloUnidade: item.intervaloUnidade,
        duracaoDias: duracaoDefinidaPeloSistema(usoContinuo, item.tipo)
            ? null
            : Number(item.duracao),
        condicaoUso: condicaoParaEnvio(item),
        quantidade: item.quantidade === "" ? null : Number(item.quantidade),
        })),
    };

    console.log("Prescrição:", dados);
    alert("Prescrição pronta para envio! (ainda sem back-end)");

    setPaciente("");
    setCpf("");
    setUsoContinuo(false);
    setItens([itemVazio(proximoId.current + 1)]);
    proximoId.current += 1;
    setArquivo(null);
    if (inputArquivoRef.current) inputArquivoRef.current.value = "";
    }

    return (
    <div className={formulario.pagina}>
        <h1 className={formulario.titulo}>Nova Prescrição</h1>

        <form className={formulario.card} onSubmit={enviar}>
        <div className={formulario.campo}>
            <label htmlFor="paciente">Paciente</label>
            <input
            id="paciente"
            type="text"
            placeholder="Nome Completo"
            value={paciente}
            onChange={(e) => setPaciente(e.target.value)}
            required
            />
        </div>

        <div className={formulario.campo}>
            <label htmlFor="cpf">CPF</label>
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
            quantidadeCalculada={null}
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

        <button type="submit" className={formulario.botao}>
            Gerar prescrição
        </button>
        </form>
    </div>
    );
}