import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtPayload } from "./jwt-auth.guard";
import { ROLES_KEY, SUPER_ADMIN_KEY } from "./roles.decorator";
import { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const alvos = [context.getHandler(), context.getClass()];

        const perfis = this.reflector.getAllAndOverride<JwtPayload['perfil'][]>(
            ROLES_KEY,
            alvos,
        );

        const apenasSuperAdmin = this.reflector.getAllAndOverride<boolean>(
            SUPER_ADMIN_KEY,
            alvos,
        );

        // Rota sem etiqueta nenhuma: não há o que checar
        if (!perfis && !apenasSuperAdmin) return true;

        const { user } = context
            .switchToHttp()
            .getRequest<Request & { user?: JwtPayload }>();

        // Se não há user, o JwtAuthGuard não rodou antes (erro de congiguração da rota)
        if (!user) throw new ForbiddenException('Acesso negado.');

        if (perfis && !perfis.includes(user.perfil)) {
            throw new ForbiddenException('Acesso negado.');
        }

        if (apenasSuperAdmin && user.nivelAcesso !== 'SUPER_ADMIN') {
            throw new ForbiddenException('Acesso negado.');
        }

        return true;
    }
}