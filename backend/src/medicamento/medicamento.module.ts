import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Medicamento } from "./medicamento.entity";
import { AuthModule } from "../auth/auth.module";
import { MedicamentoController } from "./medicamento.controller";
import { MedicamentoService } from "./medicamento.service";

@Module({
    imports    : [TypeOrmModule.forFeature([Medicamento]), AuthModule],
    controllers: [MedicamentoController],
    providers  : [MedicamentoService],
    exports    : [MedicamentoService, TypeOrmModule],
})
export class MedicamentoModule {}