import type { TipoReceita } from "../components/CardReceita";

export interface Medicamento {
    id: number;
    nome: string;
    dosagem: string;
    formaFarmaceutica: string;
    unidadeDose: string;
    tipo: TipoReceita;
}

export const medicamentos: Medicamento[] = [
    { id: 1, nome: "Dipirona", dosagem: "500 mg", formaFarmaceutica: "Comprimido", unidadeDose: "comprimido(s)", tipo: "comum" },
    { id: 2, nome: "Paracetamol", dosagem: "750 mg", formaFarmaceutica: "Comprimido", unidadeDose: "comprimido(s)", tipo: "comum" },
    { id: 3, nome: "Dipirona", dosagem: "500 mg/mL", formaFarmaceutica: "Gotas", unidadeDose: "gota(s)", tipo: "comum" },
    { id: 4, nome: "Amoxicilina", dosagem: "500 mg", formaFarmaceutica: "Cápsula", unidadeDose: "cápsula(s)", tipo: "antibiotico" },
    { id: 5, nome: "Azitromicina", dosagem: "500 mg", formaFarmaceutica: "Comprimido", unidadeDose: "comprimido(s)", tipo: "antibiotico" },
    { id: 6, nome: "Amitriptilina", dosagem: "25 mg", formaFarmaceutica: "Comprimido", unidadeDose: "comprimido(s)", tipo: "controlado" },
    { id: 7, nome: "Fluoxetina", dosagem: "20 mg", formaFarmaceutica: "Cápsula", unidadeDose: "cápsula(s)", tipo: "controlado" },
];

export function rotuloMedicamento(m: Medicamento): string {
    return `${m.nome} ${m.dosagem} (${m.formaFarmaceutica})`;
}

export function buscarMedicamento(tipo: string, rotulo: string): Medicamento | undefined {
    return medicamentos.find((m) => m.tipo === tipo && rotuloMedicamento(m) === rotulo);
}