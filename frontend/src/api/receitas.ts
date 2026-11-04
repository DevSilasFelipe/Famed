import { get, post, baixarArquivo } from "./api";

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

export type ListaControle = "C1" | "ANTIMICROBIANO" | "COMUM";

/** Linha de GET /receitas/minhas quando quem pergunta é o MÉDICO. */
export interface ReceitaDoMedico {
    medicoId    : number;
    receitaId   : number;
    token       : string;
    pacienteId  : number;
    pacienteNome: string;
    lista       : ListaControle;
    usoContinuo : boolean;
    emitidaEm   : string;        // data e hora em ISO
    dataValidade: string | null; // AAAA-MM-DD
    situacao    : string;        // hoje vem NAO_DISPENSADA em tudo: não exibir
}

/** Linha de GET /receitas/minhas quando quem pergunta é o PACIENTE. */
export interface ReceitaDoPaciente {
    pacienteId  : number;
    receitaId   : number;
    token       : string;
    medicoNome  : string;
    crm         : string;
    crmUf       : string;
    lista       : ListaControle;
    usoContinuo : boolean;
    emitidaEm   : string;
    dataValidade: string | null;
    situacao    : string;
}

export interface ReceitaParaFarmacia {
    id          : number;
    token       : string;
    emitidaEm   : string;        // data e hora em ISO
    dataValidade: string | null; // AAAA-MM-DD; COMUM não tem
    vencida     : boolean;       // o backend calcula: hoje > dataValidade
    usoContinuo : boolean;
    lista       : { codigo: ListaControle; descricao: string };
    medico      : { nome: string; crm: string; uf: string };
    paciente    : { nome: string; cpf: string };
    itens: {
        nome             : string;
        dosagem          : string;
        formaFarmaceutica: string;
        unidadeDose      : string;
        quantidade       : number;
        posologia        : string;
    }[];
}

export function buscarReceitaPorToken(token: string, tokenAcesso?: string): Promise<ReceitaParaFarmacia> {
    return get<ReceitaParaFarmacia>(`/receitas/token/${encodeURIComponent(token)}`, tokenAcesso);
}

export function emitirReceita(corpo: CorpoEmissao, token?: string): Promise<ReceitaEmitida> {
    return post<ReceitaEmitida>("/receitas", corpo, token);
}

/** Baixa o PDF da receita (só o médico emissor e o paciente da receita conseguem). */
export function baixarPdfReceita(id:number, token?: string): Promise<Blob> {
    return baixarArquivo(`/receitas/${id}/pdf`, token);
}

// É a mesma rota: o backend escolhe a view pelo perfil que está no token.
export function listarMinhasReceitasMedico(token?: string): Promise<ReceitaDoMedico[]> {
    return get<ReceitaDoMedico[]>("/receitas/minhas", token);
}

export function listarMinhasReceitasPaciente(token?: string): Promise<ReceitaDoPaciente[]> {
    return get<ReceitaDoPaciente[]>("/receitas/minhas", token);
}

/** PDF da receita para a farmácia, pedido pelo token da receita. */
export function baixarPdfReceitaPorToken(token: string, tokenAcesso?: string): Promise<Blob> {
    return baixarArquivo(`/receitas/token/${encodeURIComponent(token)}/pdf`, tokenAcesso);
}