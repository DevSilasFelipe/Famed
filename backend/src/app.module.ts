import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { ListaControleModule } from './lista-controle/lista-controle.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { AuthModule } from './auth/auth.module';
import { PacienteModule } from './paciente/paciente.module';
import { FarmaciaModule } from './farmacia/farmacia.module';
import { MedicoModule } from './medico/medico.module';
import { MedicamentoModule } from './medicamento/medicamento.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }),
            TypeOrmModule.forRootAsync({
              inject: [ConfigService],
              useFactory: (config: ConfigService) => ({
                type: 'mysql',
                host: config.get<string>('DB_HOST'),
                port: Number(config.get('DB_PORT')),
                username: config.get<string>('DB_USER'),
                password: config.get<string>('DB_PASSWORD'),
                database: config.get<string>('DB_NAME'),
                autoLoadEntities: true,
                synchronize: false
              }),
            }),

            ListaControleModule,
            AuditoriaModule,
            AuthModule,
            PacienteModule,
            FarmaciaModule,
            MedicoModule,
            MedicamentoModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
