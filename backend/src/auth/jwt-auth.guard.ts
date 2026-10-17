import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

export interface JwtPayload {
    sub: number;
    perfil: 'MEDICO' | 'PACIENTE' | 'FARMACIA' | 'ADMINISTRADOR';
    nivelAcesso?: 'ADMIN' | 'SUPER_ADMIN';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwt: JwtService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context 
            .switchToHttp()
            .getRequest<Request & { user?: JwtPayload }>();

        // Cabeçalho esperado: "Authorization: Bearer <token>"
        const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
        if (tipo !== 'Bearer' || !token) {
            throw new UnauthorizedException('Token não informado.');
        }

        try {
            request.user = await this.jwt.verifyAsync<JwtPayload>(token);
        } catch {
            throw new UnauthorizedException('Token inválido ou expirado.');
        }
        
        return true;
    }
}