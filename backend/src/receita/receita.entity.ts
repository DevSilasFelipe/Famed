import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('receita')
export class Receita {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'medico_id', type: 'int' })
    medicoId: number;

    @Column({ name: 'paciente_id', type: 'int' })
    pacienteId: number;

    @Column({ name: 'lista_controle_id', type: 'tinyint', unsigned: true })
    listaControleId: number;

    @Column({ name: 'uso_continuo', type: 'boolean' })
    usoContinuo: boolean;

    @Column({ name: 'token', type: 'char', length: 6 })
    token: string;

    @Column({ name: 'numero_sncr', type: 'varchar', length: 30, nullable: true })
    numeroSncr: string | null;

    @Column({ name: 'emitida_em', type: 'datetime' })
    emitidaEm: Date;

    @Column({ name: 'data_validade', type: 'date', nullable: true })
    dataValidade: string | null;

    @Column({ name: 'hash_sha256', type: 'char', length: 64 })
    hashSha256: string;

    @Column({ name: 'assinatura_digital', type: 'text' })
    assinaturaDigital: string;

    @Column({ name: 'medico_nome', type: 'varchar', length: 150 })
    medicoNome: string;

    @Column({ name: 'paciente_nome', type: 'varchar', length: 150 })
    pacienteNome: string;

    @Column({ name: 'paciente_endereco', type: 'varchar', length: 255 })
    pacienteEndereco: string;
}