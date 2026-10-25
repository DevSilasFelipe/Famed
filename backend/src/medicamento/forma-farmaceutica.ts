// Formas em que a quantidade NÃO pode ser calculada (gotas por mL variam de remédio
// para remédio e o frasco é a unidade de venda): o médico digita a quantidade de frascos.
const FORMAS_QUANTIDADE_MANUAL = ['gotas', 'xarope'];

export function formaExigeQuantidadeManual(forma: string): boolean {
    return FORMAS_QUANTIDADE_MANUAL.includes(forma.trim().toLocaleLowerCase());
}