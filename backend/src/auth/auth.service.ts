import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Usuario } from "../usuario/usuario.entity";
import { Repository } from "typeorm";
import { Administrador } from "../administrador/administrador.entity";
import { JwtService } from "@nestjs/jwt";
import { AuditoriaService } from "../auditoria/auditoria.service";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
        @InjectRepository(Administrador) private readonly admins: Repository<Administrador>,
        private readonly jwt: JwtService,
        private readonly auditoria: AuditoriaService,
    ) {}

    async login(dto: LoginDto, ip?: string): Promise<{ acessToken: string }> {
        const invalido = () => new UnauthorizedException('Credenciais inválidas.');

        // addSelect porque senhaHash tem select: false
        const usuario = await this.usuarios
            .createQueryBuilder('u')
            .addSelect('u.senhaHash')
            .where('u.email = :email', { email: dto.email })
            .getOne();

        if (!usuario || !usuario.senhaHash) throw invalido();
        if (!(await bcrypt.compare(dto.senha, usuario.senhaHash))) throw invalido();
        if (usuario.situacao !== 'ATIVO') throw invalido();

        const payload: { sub: number; perfil: string; nivelAcesso?: string } = {
            sub:    usuario.id,
            perfil: usuario.perfil,
        };
        
        if (usuario.perfil === 'ADMINISTRADOR') {
            const admin = await this.admins.findOneBy({ usuarioId: usuario.id });
            if (!admin) throw invalido();
            payload.nivelAcesso = admin.nivelAcesso;

            await this.auditoria.registrar({
                usuarioId: usuario.id,
                acao: 'LOGIN',
                entidade: 'usuario',
                entidadeId: usuario.id,
                ip,
            });
        }

        return { acessToken: await this.jwt.signAsync(payload) };
    }
}