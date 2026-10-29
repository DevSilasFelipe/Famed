import { Controller, Post, UseGuards, HttpCode, HttpStatus, Body, Req, Get, Param, ParseIntPipe, Res, StreamableFile } from "@nestjs/common";
import { JwtAuthGuard, JwtPayload } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { ReceitaService } from "./receita.service";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { PrepararReceitaDto } from "./dto/preparar-receita.dto";
import { Request } from "express";
import { EmitirReceitaDto } from "./dto/emitir-receita.dto";
import { ReceitaPdfService } from "./receita-pdf.service";
import type { Response } from "express";
import { montarDadosPfd } from "./receita-pdf-dados";

@Controller('receitas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDICO')
export class ReceitaController {
    constructor(
        private readonly service: ReceitaService,
        private readonly pdf: ReceitaPdfService,
        private readonly auditoria: AuditoriaService,
    ) {}

    @Post('preparar')
    @HttpCode(HttpStatus.OK) // não cria nada: 200, não 201
    preparar(
        @Body() dto: PrepararReceitaDto,
        @Req()  req: Request & { user: JwtPayload },
    ) {
        return this.service.preparar(dto, req.user.sub);
    }

    @Post()
    async emitir(
        @Body() dto: EmitirReceitaDto,
        @Req()  req: Request & { user: JwtPayload },
    ) {
        const receita = await this.service.emitir(dto, req.user.sub);

        await this.auditoria.registrar({
            usuarioId: req.user.sub,
            acao: 'EMITIR',
            entidade: 'receita',
            entidadeId: receita.id,
            ip: req.ip,
        });

        return receita;
    }

    @Get(':id/pdf')
    @Roles('MEDICO', 'PACIENTE') // sobrescreve o @Roles('MEDICO') da classe
    async baixarPdf(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request & { user: JwtPayload },
        @Res({ passthrough: true }) res: Response,
    ) {
        const leitura = await this.service.buscarParaPdf(id, req.user.sub);
        const arquivo = await this.pdf.gerar(montarDadosPfd(leitura));

        await this.auditoria.registrar({
            usuarioId: req.user.sub,
            acao: 'BAIXAR_PDF',
            entidade: 'receita',
            entidadeId: id,
            ip: req.ip,
        });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="receita-${leitura.receita.token}.pdf"`,
        });
        return new StreamableFile(arquivo);
    }
}