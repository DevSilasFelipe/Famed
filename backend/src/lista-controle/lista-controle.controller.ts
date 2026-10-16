import { Controller, Get, Post, Body } from "@nestjs/common";
import { ListaControleService } from "./lista-controle.service";
import { CriarListaControleDto } from "./dto/criar-lista-controle.dto";

@Controller('lista-controle')
export class ListaControleController {
    constructor(private readonly service: ListaControleService) {}

    @Get()
    listar() {
        return this.service.listar();
    }

    @Post()
    listaControle(@Body() dto: CriarListaControleDto) {
        return this.service.criar(dto);
    }

}