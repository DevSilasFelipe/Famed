import { UnprocessableEntityException } from "@nestjs/common";

export type ListaCodigo      = 'C1' | 'ANTIMICROBIANO' | 'COMUM';
export type IntervaloUnidade = 'HORAS' | 'DIAS' | 'SEMANAS';

/**
 * Duração máxima do tratamento, em dias, por lista do medicamento.
 * No uso contínuo é a própria duração prescrita; fora dele é o teto do que o médico pode digitar.
 */
export const DURACAO_MAXIMA_DIAS: Record<ListaCodigo, number> = {
    C1: 60,
    ANTIMICROBIANO: 90,
    COMUM: 180,
};

export const QUANTIDADE_MAXIMA = 65535; // SMALLINT UNSIGNED

export function regra(mensagem: string): UnprocessableEntityException {
    return new UnprocessableEntityException({ statusCode: 422, message: mensagem });
}

/** Lista da receita: a mais restritiva entre os itens. COMUM só se todos forem comuns. */
export function determinarLista(codigos: ListaCodigo[]): ListaCodigo {
    const temC1 = codigos.includes('C1');
    const temAntimicrobiano = codigos.includes('ANTIMICROBIANO');

    if (temC1 && temAntimicrobiano) {
        throw regra('Antimicrobiano e medicamento controlado (C1) não podem estar na mesma receita.');
    }
    if (temC1) return 'C1';
    if (temAntimicrobiano) return 'ANTIMICROBIANO';
    return 'COMUM';
}

/** Dias de tratamento do item: mapa no uso contínuo; informado (e limitado ao teto) nos demais casos. */
export function duracaoEfetiva(
    lista: ListaCodigo,
    usoContinuo: boolean,
    duracaoDias: number | undefined,
    rotulo: string,
): number {
    const maximo = DURACAO_MAXIMA_DIAS[lista];
    if (maximo === undefined) throw regra(`${rotulo}: lista de controle sem regra de duração.`);

    if (usoContinuo) return maximo;

    if (duracaoDias === undefined || duracaoDias === null) {
        throw regra(`${rotulo}: a duração máxima é de ${maximo} dias.`);
    }
    return duracaoDias;
}

function dosesPorDia(intervaloValor: number, unidade: IntervaloUnidade): number {
    switch (unidade) {
        case 'HORAS'  : return 24 / intervaloValor;
        case 'DIAS'   : return 1 / intervaloValor;
        case 'SEMANAS': return 1 / (7 * intervaloValor);
    }
}

/** Quantidade de unidades (comprimidos, cápsulas...) = dose × doses por dia × dias, arredondado para cima. */
export function calcularQuantidade(
    dose          : number,
    intervaloValor: number,
    unidade       : IntervaloUnidade,
    dias          : number,
    rotulo        : string,
): number {
    const total = dose * dosesPorDia(intervaloValor, unidade) * dias;
    const quantidade = Math.max(1, Math.ceil(total - 1e-9));

    if (quantidade > QUANTIDADE_MAXIMA) {
        throw regra(`${rotulo}: quantidade calculada (${quantidade}) acima do limite permitido.`);
    }
    return quantidade;
}

function plural(n: number, singular: string, pluralForma: string): string {
    return n === 1 ? singular : pluralForma;
}

function formatarDuracao(dias: number, intervaloUnidade: IntervaloUnidade): string {
    if (intervaloUnidade === 'SEMANAS' && dias % 7 === 0) {
        const semanas = dias / 7;
        return `${semanas} ${plural(semanas, 'semana', 'semanas')}`;
    }
    return `${dias} ${plural(dias, 'dia', 'dias')}`;
}

/** Ex.: "Tomar 10 gotas de 8/8 horas por 3 dias, se dor" */
export function gerarPosologia(p: {
    dose            : number;
    unidadeDose     : string;
    intervaloValor  : number;
    intervaloUnidade: IntervaloUnidade;
    dias            : number;
    condicaoUso?    : string;
}): string {
    const dose = String(p.dose).replace('.', ',');
    const unidade = p.dose > 1 ? `${p.unidadeDose}s` : p.unidadeDose;
    const v = p.intervaloValor;

    let intervalo: string;
    switch (p.intervaloUnidade) {
        case 'HORAS':
            intervalo = `de ${v}/${v} horas`;
            break;
        case 'DIAS':
            intervalo = v === 1 ? '1 vez ao dia' : `a cada ${v} dias`;
            break;
        case 'SEMANAS':
            intervalo = v === 1 ? '1 vez por semana' : `a cada ${v} semanas`;
            break;
    }

    let texto = `Tomar ${dose} ${unidade} ${intervalo} por ${formatarDuracao(p.dias, p.intervaloUnidade)}`;
    if (p.condicaoUso) texto += `, ${p.condicaoUso}`;
    return texto;
}

function formatarData(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
}

/** Validade: janela do uso contínuo (se houver) ou validade_dias da lista; NULL se a lista não tem prazo. */
export function calcularDataValidade(
    emitidaEm: Date,
    validadeDias: number | null,
    usoContinuoMaxDias: number | null,
    usoContinuo: boolean,
): string | null {
    const dias = usoContinuo && usoContinuoMaxDias ? usoContinuoMaxDias : validadeDias;
    if (!dias) return null;

    const data = new Date(emitidaEm);
    data.setDate(data.getDate() + dias);
    return formatarData(data);
}