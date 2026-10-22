export type Perfil = "medico" | "paciente" | "farmacia";

const CHAVE = "tipoUsuario";

export function iniciarSessao(perfil: Perfil) {
    sessionStorage.setItem(CHAVE, perfil);
}

export function encerrarSessao() {
    sessionStorage.removeItem(CHAVE);
}

export function perfilLogado(): Perfil | null {
    const valor = sessionStorage.getItem(CHAVE);
    if (valor === "medico" || valor === "paciente" || valor === "farmacia") {
    return valor;
    }
    return null;
}

export const rotaInicial: Record<Perfil, string> = {
    medico: "/medico",
    paciente: "/paciente",
    farmacia: "/farmacia",
};