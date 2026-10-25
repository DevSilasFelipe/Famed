import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MedicoService } from './medico.service';
import { CriarMedicoDto } from './dto/criar-medico.dto';

@Controller('medicos')
export class MedicoController {
  constructor(private readonly service: MedicoService) {}

  @Post()
  criar(@Body() dto: CriarMedicoDto) {
    return this.service.criar(dto);
  }

  @Post('validar')
  @HttpCode(200)
  async validar(@Body() dto: CriarMedicoDto) {
    await this.service.validar(dto);
    return { valido: true};
  }
}