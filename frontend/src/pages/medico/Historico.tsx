import ListaReceitas from "../../components/ListaReceitas";
import type { ReceitaResumo } from "../../components/ListaReceitas";

const receitas: ReceitaResumo[] = [
    { id: 1, tipo: "antibiotico", nome: "Maria Souza", token: "A1B2C3" },
    { id: 2, tipo: "controlado", nome: "João Pereira", token: "D4E5F6" },
    { id: 3, tipo: "comum", nome: "Ana Lima", token: "G7H8I9" },
];

export default function Historico() {
    return <ListaReceitas receitas={receitas} rotulo="Paciente" />;
}