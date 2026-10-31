import { View, ViewColumn, ViewEntity} from "typeorm";
import { colunaData} from "../common/view-transformers";
import { Paciente } from "../paciente/paciente.entity";

@ViewEntity({ name: 'vw_meus_pacientes' })
export class VwMeusPacientes {
    @ViewColumn({ name: 'medico_id' })
    medicoId: number;

    @ViewColumn({ name: 'paciente_id' })
    pacienteId: number;

    @ViewColumn({ name: 'paciente_nome' })
    pacienteNome: string;

    @ViewColumn({ name: 'cpf' })
    cpf: string;

    @ViewColumn({ name: 'data_nascimento', transformer: colunaData })
    dataNascimento: string;

    @ViewColumn({ name: 'idade' })
    idade: number;

    @ViewColumn({ name: 'telefone' })
    telefone: string | null;

    @ViewColumn({ name: 'total_receitas' })
    totalReceitas: number;

    @ViewColumn({ name: 'ultima_receita_em' })
    ultimaReceitaEm: Date;
}