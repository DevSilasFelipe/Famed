export type Perfil = "medico" | "paciente" | "farmacia";

const CHAVE_PERFIL = "tipoUsuario";
const CHAVE_TOKEN  = "accessToken";

export function paraPerfil(valor: string): Perfil | null {
    const perfil = valor.toLowerCase()
    return perfil === "medico" || perfil === "paciente" || perfil === "farmacia" ? perfil : null;
}

export function iniciarSessao(perfil: Perfil, token: string) {
    sessionStorage.setItem(CHAVE_PERFIL, perfil);
    sessionStorage.setItem(CHAVE_TOKEN, token);
}

export function encerrarSessao() {
    sessionStorage.removeItem(CHAVE_PERFIL);
    sessionStorage.removeItem(CHAVE_TOKEN);
}

export function perfilLogado(): Perfil | null {
    const valor = sessionStorage.getItem(CHAVE_PERFIL);
    return valor ? paraPerfil(valor) : null;
    
}

export const rotaInicial: Record<Perfil, string> = {
    medico: "/medico",
    paciente: "/paciente",
    farmacia: "/farmacia",
};