import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ListaControle } from "./lista-controle.entity";
import { ListaControleController } from "./lista-controle.controller";
import { ListaControleService } from "./lista-controle.service";

@Module({
    imports: [TypeOrmModule.forFeature([ListaControle])],
    controllers: [ListaControleController],
    providers: [ListaControleService],
})
export class ListaControleModule {}