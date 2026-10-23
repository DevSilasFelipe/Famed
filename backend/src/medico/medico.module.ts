import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Medico } from './medico.entity';
import { CfmRegistro } from '../cfm-registro/cfm-registro.entity';
import { MedicoController } from './medico.controller';
import { MedicoService } from './medico.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Medico, CfmRegistro])],
  controllers: [MedicoController],
  providers: [MedicoService],
})
export class MedicoModule {}