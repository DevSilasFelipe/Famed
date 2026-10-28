import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medicamento } from "./medicamento.entity";
import { formaExigeQuantidadeManual } from "./forma-farmaceutica";

export interface MedicamentoResposta {
    id               : number;
    nome             : string;
    dosagem          : string;
    formaFarmaceutica: string;
    unidadeDose      : string;
    listaControle    : string; // C1 | ANTIMICROBIANO | COMUM 
    quantidadeManual : boolean; // true: o médico digita a quantidade de frascos
}

@Injectable()
export class MedicamentoService {
    constructor(
        @InjectRepository(Medicamento)
        private readonly repo: Repository<Medicamento>,
    ) {}

    async listarAtivos(): Promise<MedicamentoResposta[]> {
        const meds = await this.repo.find({
            where    : { ativo: true },
            relations: { listaControle: true },
            order    : { nome: 'ASC', dosagem: 'ASC' },
        });

        return meds.map((m) => ({
            id               : m.id,
            nome             : m.nome, 
            dosagem          : m.dosagem,
            formaFarmaceutica: m.formaFarmaceutica,
            unidadeDose      : m.unidadeDose,
            listaControle    : m.listaControle.codigo,
            quantidadeManual : formaExigeQuantidadeManual(m.formaFarmaceutica),
        }));
    }
}