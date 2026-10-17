import { SetMetadata } from "@nestjs/common";
import { JwtPayload } from "./jwt-auth.guard";

export const ROLES_KEY = 'roles';
export const SUPER_ADMIN_KEY = 'superAdminOnly';

// Marca quais perfis podem usar a rota
export const Roles = (...perfis: JwtPayload['perfil'][]) =>
    SetMetadata(ROLES_KEY, perfis);

// Marca rotas exclusivas do SUPER_ADMIN: @SuperAdminOnly()
export const SuperAdminOnly = () => SetMetadata(SUPER_ADMIN_KEY, true);