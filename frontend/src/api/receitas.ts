import { post } from "./api";

/** Um medicamento como o backend espera receber. Campos opcionais devem ser omitidos, não enviados como null. */
export interface ItemReceitaEnvio {
    medicamentoId   : number;
    dose            : number;
    intervaloValor  : number;
    intervaloUnidade: "HORAS" | "DIAS" | "SEMANAS";
    duracaoDias?    : number; // omitir no uso contínuo (o backend define)
    condicaoUso?    : string;
    quantidade?     : number; // só para gotas e xarope (frascos)
}

export interface CorpoReceita {
    pacienteCpf: string; // 11 dígitos
    usoContinuo: boolean;
    itens      : ItemReceitaEnvio[];
}

/** O que a tela de conferência mostra: tudo o que o médico vai assinar (sem token e sem hash). */
export interface ResumoReceita {
    lista      : "C1" | "ANTIMICROBIANO" | "COMUM";
    usoContinuo: boolean;
    dataValidade          : string | null; // AAAA-MM-DD
    validadePrimeiraCompra: string | null; // igual a dataValidade, exceto antimicrobiano de uso contínuo
    paciente: { nome: string; cpf: string; endereco: string };
    itens: {
        medicamentoId: number;
        nome         : string;
        dosagem      : string;
        quantidade   : number;
        duracaoDias  : number;
        posologia    : string;
    }[];
}

export interface RespostaPreparar {
    textoCanonico: string; // o que será assinado (nunca exibido ao médico)
    hash         : string;
    selo         : string; // vale 10 minutos
    resumo       : ResumoReceita;
}

export function prepararReceita(corpo: CorpoReceita, token?: string) : Promise<RespostaPreparar> {
    return post<RespostaPreparar>("/receitas/preparar", corpo, token);
}

export interface CorpoEmissao extends CorpoReceita {
    selo      : string; // devolvido pelo preparar
    assinatura: string; // base64
}

export interface ReceitaEmitida {
    id          : number;
    token       : string;
    lista       : string;
    emitidaEm   : string;
    dataValidade: string | null;
    hash        : string;
}

export function emitirReceita(corpo: CorpoEmissao, token?: string): Promise<ReceitaEmitida> {
    return post<ReceitaEmitida>("/receitas", corpo, token);
}