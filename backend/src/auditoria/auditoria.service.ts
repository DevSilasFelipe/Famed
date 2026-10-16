import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LogAuditoria } from "./log-auditoria.entity";

export interface RegistrarAuditoria {
    usuarioId: number;
    acao: string;
    entidade: string;
    entidadeId?: number;
    sucesso?: boolean;
    ip?: string;
    detalhes?: Record<string, unknown>;
}

@Injectable()
export class AuditoriaService {
    constructor(
        @InjectRepository(LogAuditoria)
        private readonly repo: Repository<LogAuditoria>,
    ) {}

    registrar(dados: RegistrarAuditoria): Promise<LogAuditoria> {
        return this.repo.save(this.repo.create(dados));
    } 
}