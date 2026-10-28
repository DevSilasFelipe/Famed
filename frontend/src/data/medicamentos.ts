import type { TipoReceita } from "../components/CardReceita";
import { get } from "../api/api";

export interface Medicamento {
    id               : number;
    nome             : string;
    dosagem          : string;
    formaFarmaceutica: string;
    unidadeDose      : string;
    tipo             : TipoReceita;
    quantidadeManual : boolean; // true: o médico digita a quantidade de frascos
}

interface MedicamentoApi {
    id               : number;
    nome             : string;
    dosagem          : string;
    formaFarmaceutica: string;
    unidadeDose      : string;
    listaControle    : string; // COMUM | ANTIMICROBIANO | C1
    quantidadeManual : boolean;
}

const tipoPorLista: Record<string, TipoReceita> = {
    COMUM         : "comum",
    ANTIMICROBIANO: "antibiotico",
    C1            : "controlado",
};

export async function listarMedicamentos(token?: string): Promise<Medicamento[]> {
    const lista = await get<MedicamentoApi[]>("/medicamentos", token);

    return lista.flatMap((m) => {
        const tipo = tipoPorLista[m.listaControle];
        if (!tipo) return []; // lista que o formulário ainda não conhece
        return [{
            id               : m.id,
            nome             : m.nome,
            dosagem          : m.dosagem,
            formaFarmaceutica: m.formaFarmaceutica,
            unidadeDose      : m.unidadeDose,
            quantidadeManual : m.quantidadeManual,
            tipo,
        }];
    });
}

export function rotuloMedicamento(m: Medicamento): string {
    return `${m.nome} ${m.dosagem} (${m.formaFarmaceutica})`;
}

export function buscarMedicamento(
    lista : Medicamento[],
    tipo  : string,
    rotulo: string,
): Medicamento | undefined {
    return lista.find((m) => m.tipo === tipo && rotuloMedicamento(m) === rotulo);
}