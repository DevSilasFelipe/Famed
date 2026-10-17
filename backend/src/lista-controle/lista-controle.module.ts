import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListaControle } from "./lista-controle.entity";
import { ListaControleController } from "./lista-controle.controller";
import { ListaControleService } from "./lista-controle.service";
import { AuthModule } from "../auth/auth.module";
import { AuditoriaModule } from "../auditoria/auditoria.module";

@Module({
    imports: [TypeOrmModule.forFeature([ListaControle]), AuthModule, AuditoriaModule],
    controllers: [ListaControleController],
    providers: [ListaControleService],
})
export class ListaControleModule {}