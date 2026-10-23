export interface CnpjInfo {
    cnpj: string;
    razao_social: string;
    nome_fantasia: string | null;
    descricao_situacao_cadastral: string;
    cnae_fiscal: number;
}

export abstract class CnpjProvider {
    abstract consultar(cnpj: string): Promise<CnpjInfo | null>;
}