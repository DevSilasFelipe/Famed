import { formaExigeQuantidadeManual } from "../medicamento/forma-farmaceutica";
import { calcularDataValidade } from "./receita-calculo";
import type { ReceitaService } from "./receita.service";

type Leitura = Awaited<ReturnType<ReceitaService['buscarParaPdf']>>;

export interface DadosPdf {
    emitente   : { nome: string; crm: string };
    tipo       : string;
    usoContinuo: boolean;
    data       : string;
    validade   : { rotulo: string; valor: string }[];
    paciente   : {nome: string; cpf: string; endereco: string };
    itens      : {nome: string; dosagem: string; quantidade: string; posologia: string }[];
    token      : string;
    numeroSncr : string | null;
    assinatura : { assinadoPor: string; algoritmo: string; hash: string };
}

function zeroEsquerda(n: number): string {
    return String(n).padStart(2, '0');
}

/** "2026-11-05" -> "05/11/2026" (sem Date, para não deslocar o dia por fuso). */
function formatarDataIso(iso: string): string {
    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
}

function formatarCpf(cpf: string): string {
    return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

function liberacao(quantidade: number, forma: string, unidadeDose: string): string {
    if (formaExigeQuantidadeManual(forma)) {
        return `${quantidade} ${quantidade === 1 ? 'frasco' : 'frascos'}`;
    }
    return `${quantidade} ${quantidade === 1 ? unidadeDose : `${unidadeDose}s`}`;
}

function montarValidade(leitura: Leitura): { rotulo: string; valor: string }[] {
    const { receita, lista } = leitura;

    if (!receita.dataValidade) {
        return [{ rotulo: 'DATA DE VALIDADE:', valor: 'Sem prazo de validade' }];
    }

    // 1ª compra: só a validade da lista, sem a janela do uso contínuo (não é gravada, é derivada)
    const primeiraCompra = calcularDataValidade(receita.emitidaEm, lista.validadeDias, null, false);

    if (receita.usoContinuo && primeiraCompra && primeiraCompra !== receita.dataValidade) {
        return [
            { rotulo: 'PRIMEIRA COMPRA ATÉ:', valor: formatarDataIso(primeiraCompra) },
            { rotulo: 'APÓS PRIMEIRA COMPRA - Receita válida até:', valor: formatarDataIso(receita.dataValidade) },
        ];
    }

    return [{ rotulo: 'DATA DE VALIDADE:', valor: formatarDataIso(receita.dataValidade) }];
}

export function montarDadosPdf(leitura: Leitura): DadosPdf {
    const { receita, lista, medico, paciente, itens } = leitura;
    const e = receita.emitidaEm;
    const crm = `${medico.crm} - ${medico.uf}`;
    const data = `${zeroEsquerda(e.getDate())}/${zeroEsquerda(e.getMonth() + 1)}/${e.getFullYear()}`;
    const hora = `${zeroEsquerda(e.getHours())}:${zeroEsquerda(e.getMinutes())}`;

    return {
        emitente   : { nome: receita.medicoNome, crm },
        tipo       : lista.codigo,
        usoContinuo: receita.usoContinuo,
        data       : data,
        validade   : montarValidade(leitura),
        paciente: {
            nome: receita.pacienteNome,
            cpf : formatarCpf(paciente.cpf),
            endereco: receita.pacienteEndereco,
        },
        itens: itens.map((i) => ({
            nome      : i.nome,
            dosagem   : i.dosagem,
            quantidade: liberacao(i.quantidade, i.formaFarmaceutica, i.unidadeDose),
            posologia : i.posologia,
        })),
        token: receita.token,
        numeroSncr: receita.numeroSncr,
        assinatura: {
            assinadoPor: `Assinado digitalmente por ${receita.medicoNome}, CRM ${crm}, em ${data} às ${hora}`,
            algoritmo: 'RSA / SHA-256',
            hash: receita.hashSha256,
        },
    };
}