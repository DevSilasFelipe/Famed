import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { MedicoService } from './medico.service';
import { JwtAuthGuard, JwtPayload } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('medico')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('MEDICO')
export class MedicoPacientesController {
  constructor(private readonly service: MedicoService) {}

  @Get('meus-pacientes')
  meusPacientes(@Req() req: Request & { user: JwtPayload }) {
    return this.service.listarMeusPacientes(req.user.sub);
  }
}