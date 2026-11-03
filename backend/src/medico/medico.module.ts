import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/usuario.entity';
import { Medico } from './medico.entity';
import { CfmRegistro } from '../cfm-registro/cfm-registro.entity';
import { MedicoController } from './medico.controller';
import { MedicoService } from './medico.service';
import { AuthModule} from '../auth/auth.module';
import { VwMeusPacientes } from './vw-meus-pacientes.view';
import { MedicoPacientesController } from './medico-pacientes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Medico, CfmRegistro, VwMeusPacientes]), AuthModule],
  controllers: [MedicoController, MedicoPacientesController],
  providers: [MedicoService],
})
export class MedicoModule {}