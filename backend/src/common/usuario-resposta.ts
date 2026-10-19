import { Usuario } from '../usuario/usuario.entity';

export interface UsuarioResposta {
    id: number,
    nome: string,
    email: string | null,
    perfil: string,
    situacao: string;
}

export function paraResposta(u: Usuario): UsuarioResposta {
    return {
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil,
        situacao: u.situacao,
    };
}