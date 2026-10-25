import { Controller, Get, UseGuards } from "@nestjs/common";
import { MedicamentoService } from "./medicamento.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@Controller('medicamentos')
export class MedicamentoController {
    constructor(private readonly service: MedicamentoService) {}

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MEDICO')
    listar() {
        return this.service.listarAtivos();
    }
}