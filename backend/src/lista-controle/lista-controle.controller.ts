import { Controller, Get, Post, Body, UseGuards, Req } from "@nestjs/common";
import { ListaControleService } from "./lista-controle.service";
import { CriarListaControleDto } from "./dto/criar-lista-controle.dto";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { JwtAuthGuard, JwtPayload } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles, SuperAdminOnly } from "../auth/roles.decorator";
import { Request } from "express";

@Controller('lista-controle')
export class ListaControleController {
    constructor(
        private readonly service  : ListaControleService,
        private readonly auditoria: AuditoriaService,
    ) {}

    @Get()
    listar() {
        return this.service.listar();
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMINISTRADOR')
    @SuperAdminOnly()
    async listaControle(
        @Body() dto: CriarListaControleDto,
        @Req() req : Request & { user: JwtPayload },
    ) {
        const lista = await this.service.criar(dto);
        
        await this.auditoria.registrar({
            usuarioId : req.user.sub,
            acao      : 'CRIAR',
            entidade  : 'lista_controle',
            entidadeId: lista.id,
            ip        : req.ip, 
        });

        return lista;
    }

}