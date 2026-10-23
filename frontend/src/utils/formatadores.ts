export function somenteNumeros(texto: string): string {
    return texto.replace(/\D/g, "");
}

export function somenteAlfanumericos(texto: string): string {
    return texto.replace(/[^A-Za-z0-9]/g, "");
}

export function somenteDecimal(texto: string): string {
    const comVirgula = texto.replace(/[^0-9.,]/g, "").replace(/\./g, ",");
    const [inteiro, ...resto] = comVirgula.split(",");
    const parteInteira = inteiro.slice(0, 4);

    if (resto.length === 0) return parteInteira;
    return `${parteInteira},${resto.join("").slice(0, 2)}`;
}

export function decimalParaNumero(texto: string): number {
    return Number(texto.replace(",", "."));
}