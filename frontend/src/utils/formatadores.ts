export function somenteNumeros(texto: string): string {
    return texto.replace(/\D/g, "");
}

export function somenteAlfanumericos(texto: string): string {
    return texto.replace(/[^A-Za-z0-9]/g, "");
}