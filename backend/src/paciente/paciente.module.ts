import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { Usuario } from '../usuario/usuario.entity';
import { Paciente } from './paciente.entity';
import { PacienteController } from './paciente.controller';
import { PacienteService } from './paciente.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Paciente]), AuthModule, AuditoriaModule],
  controllers: [PacienteController],
  providers: [PacienteService],
})
export class PacienteModule {}