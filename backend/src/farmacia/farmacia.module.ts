import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Farmacia } from './farmacia.entity';
import { FarmaciaController } from './farmacia.controller';
import { FarmaciaService } from './farmacia.service';
import { CnpjProvider } from './cnpj.provider';
import { CnpjMockProvider } from './cnpj-mock.provider';

@Module({
    imports: [TypeOrmModule.forFeature([Usuario, Farmacia])],
    controllers: [FarmaciaController],
    providers: [
        FarmaciaService,
        { provide: CnpjProvider, useClass: CnpjMockProvider },
    ],

})
export class FarmaciaModule {}