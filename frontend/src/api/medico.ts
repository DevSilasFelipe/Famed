import { get } from "./api";

/** Linha de GET /medico/meus-pacientes. */
export interface PacienteDoMedico {
    medicoId       : number;
    pacienteId     : number;
    pacienteNome   : string;
    cpf            : string;
    dataNascimento : string;       // AAAA-MM-DD
    idade          : number;
    telefone       : string | null;
    totalReceitas  : number;
    ultimaReceitaEm: string;       // data e hora em ISO
}

export function listarMeusPacientes(token?: string): Promise<PacienteDoMedico[]> {
    return get<PacienteDoMedico[]>("/medico/meus-pacientes", token);
}