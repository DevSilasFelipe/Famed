import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Usuario } from "../usuario/usuario.entity";
import { Administrador } from "../administrador/administrador.entity";
import { AuditoriaModule } from "../auditoria/auditoria.module";
import { JwtModule, JwtSignOptions } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario, Administrador]),
        AuditoriaModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: config.get<string>('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'],
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers:   [AuthService],
    exports:     [JwtModule], 
})
export class AuthModule {}