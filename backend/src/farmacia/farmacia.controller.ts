import { Body, Controller, Post } from '@nestjs/common';
import { FarmaciaService } from './farmacia.service';
import { CriarFarmaciaDto } from './dto/criar-farmacia.dto';

@Controller('farmacias')
export class FarmaciaController {
    constructor(private readonly service: FarmaciaService) {}

    @Post()
    criar(@Body() dto: CriarFarmaciaDto) {
        return this.service.criar(dto);
    }
}