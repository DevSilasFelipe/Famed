import { Injectable } from "@nestjs/common";
import { readFile, readFileSync } from "fs";
import { join } from "path";
import {CnpjInfo, CnpjProvider } from './cnpj.provider';

@Injectable()
export class CnpjMockProvider extends CnpjProvider {
    private readonly base: Record<string, CnpjInfo> = JSON.parse(
        readFileSync(join(__dirname, 'mock', 'cnpj-mock.json'), 'utf-8'),
    );

    async consultar(cnpj: string): Promise<CnpjInfo | null> {
        return this.base[cnpj] ?? null;
    }
}