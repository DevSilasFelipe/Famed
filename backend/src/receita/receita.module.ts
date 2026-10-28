import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Receita } from "./receita.entity";
import { ItemReceita } from "./item-receita.entity";
import { AuthModule } from "../auth/auth.module";
import { AuditoriaModule } from "../auditoria/auditoria.module";
import { ReceitaController } from "./receita.controller";
import { ReceitaService } from "./receita.service";

@Module({
    imports    : [TypeOrmModule.forFeature([Receita, ItemReceita]), AuthModule, AuditoriaModule],
    controllers: [ReceitaController],
    providers  : [ReceitaService],
})
export class ReceitaModule {}