import { Body, Controller, Post } from '@nestjs/common';
import { MedicoService } from './medico.service';
import { CriarMedicoDto } from './dto/criar-medico.dto';

@Controller('medicos')
export class MedicoController {
  constructor(private readonly service: MedicoService) {}

  @Post()
  criar(@Body() dto: CriarMedicoDto) {
    return this.service.criar(dto);
  }
}