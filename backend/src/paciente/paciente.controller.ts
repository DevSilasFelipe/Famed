import { Body, Controller, Post } from '@nestjs/common';
import { PacienteService } from './paciente.service';
import { CriarPacienteDto } from './dto/criar-paciente.dto';

@Controller('pacientes')
export class PacienteController {
    constructor(private readonly service: PacienteService) {}

    @Post()
    criar(@Body() dto: CriarPacienteDto) {
        return this.service.criar(dto);
    }
}