import type { TipoReceita } from "../components/CardReceita";

/** O banco diz C1 / ANTIMICROBIANO / COMUM; o card espera controlado / antibiotico / comum. */
export function tipoDaLista(lista: string): TipoReceita {
    if (lista === "C1") return "controlado";
    if (lista === "ANTIMICROBIANO") return "antibiotico";
    return "comum";
}