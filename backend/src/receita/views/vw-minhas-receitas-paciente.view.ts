import { ViewColumn, ViewEntity } from "typeorm";
import { colunaBooleana, colunaData } from "../../common/view-transformers";

@ViewEntity({ name: 'vw_minhas_receitas_paciente' })
export class VwMinhasReceitasPaciente {
  @ViewColumn({ name: 'paciente_id' })
  pacienteId: number;

  @ViewColumn({ name: 'receita_id' })
  receitaId: number;

  @ViewColumn({ name: 'token' })
  token: string;

  @ViewColumn({ name: 'medico_nome' })
  medicoNome: string;

  @ViewColumn({ name: 'crm' })
  crm: string;

  @ViewColumn({ name: 'crm_uf' })
  crmUf: string;

  @ViewColumn({ name: 'lista' })
  lista: string;

  @ViewColumn({ name: 'uso_continuo', transformer: colunaBooleana })
  usoContinuo: boolean;

  @ViewColumn({ name: 'emitida_em' })
  emitidaEm: Date;

  @ViewColumn({ name: 'data_validade', transformer: colunaData })
  dataValidade: string | null;

  @ViewColumn({ name: 'situacao' })
  situacao: string;
}