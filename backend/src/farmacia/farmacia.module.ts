import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Usuario } from '../usuario/usuario.entity';
import { Farmacia } from './farmacia.entity';
import { FarmaciaController } from './farmacia.controller';
import { FarmaciaService } from './farmacia.service';
import { CnpjProvider } from './cnpj.provider';
import { CnpjMockProvider } from './cnpj-mock.provider';
import { BrasilApiCnpjProvider } from './cnpj-brasilapi.provider';

@Module({
    imports: [TypeOrmModule.forFeature([Usuario, Farmacia])],
    controllers: [FarmaciaController],
    providers: [
        FarmaciaService,
        {
         provide: CnpjProvider,
         inject: [ConfigService],
         useFactory: (config: ConfigService): CnpjProvider =>
            config.get<string>('CNPJ_PROVIDER') === 'brasilapi'
                ? new BrasilApiCnpjProvider()
                : new CnpjMockProvider(),
      },
    ],

})
export class FarmaciaModule {}