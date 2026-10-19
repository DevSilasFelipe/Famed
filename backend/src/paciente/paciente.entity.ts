import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('paciente')
export class Paciente {
  @PrimaryColumn({ name: 'usuario_id' })
  usuarioId: number;

  @Column({ name: 'cpf' })
  cpf: string;

  @Column({ name: 'data_nascimento', type: 'date' })
  dataNascimento: string;

  @Column({ name: 'sexo', type: 'char', length: 1, nullable: true })
  sexo: string | null;

  @Column({ name: 'cadastrado_por', type: 'int', nullable: true })
  cadastradoPor: number | null;
}