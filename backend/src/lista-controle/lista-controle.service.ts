import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ListaControle } from "./lista-controle.entity";
import { CriarListaControleDto } from "../common/dto/criar-lista-controle.dto";

@Injectable()
export class ListaControleService {
    constructor(
        @InjectRepository(ListaControle)
        private readonly repo: Repository<ListaControle>,
    ) {}

    listar(): Promise<ListaControle[]> {
        return this.repo.find();
    }

    criar(dto: CriarListaControleDto): Promise<ListaControle> {
        return this.repo.save(this.repo.create(dto))
    }
}