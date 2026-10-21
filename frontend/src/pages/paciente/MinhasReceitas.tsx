import ListaReceitas from "../../components/ListaReceitas";
import type { ReceitaResumo } from "../../components/ListaReceitas";

const receitas: ReceitaResumo[] = [
    { id: 1, tipo: "antibiotico", nome: "Dr. Carlos Lima", token: "A1B2C3" },
    { id: 2, tipo: "controlado", nome: "Dra. Paula Rocha", token: "D4E5F6" },
    { id: 3, tipo: "comum", nome: "Dr. Carlos Lima", token: "G7H8I9" },
];

export default function MinhasReceitas() {
    return <ListaReceitas receitas={receitas} rotulo="Médico" />;
}