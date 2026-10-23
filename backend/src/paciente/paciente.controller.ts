import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PacienteService } from './paciente.service';
import { CriarPacienteDto } from './dto/criar-paciente.dto';
import { CriarPacientePorMedicoDto } from './dto/criar-paciente-por-medico.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('pacientes')
export class PacienteController {
    constructor(
        private readonly service: PacienteService,
        private readonly auditoria: AuditoriaService,
    ) {}

    @Post()
    criar(@Body() dto: CriarPacienteDto) {
        return this.service.criar(dto);
    }

    @Post('por-medico')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MEDICO')
    async criarPorMedico(
        @Body() dto: CriarPacientePorMedicoDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        const paciente = await this.service.criarPorMedico(dto, req.user.sub);

        await this.auditoria.registrar({
            usuarioId: req.user.sub,
            acao: 'CRIAR',
            entidade: 'paciente',
            entidadeId: paciente.id,
            ip: req.ip,
        });

        return paciente;
    }
}