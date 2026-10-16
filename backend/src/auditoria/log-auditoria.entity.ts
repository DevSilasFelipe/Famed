import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('log_auditoria')
export class LogAuditoria {
    @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
    id: string;

    @Column({ name: 'usuario_id', type: 'int'})
    usuarioId: number;

    @Column({ name: 'acao', type: 'varchar'})
    acao: string;

    @Column({ name: 'entidade', type: 'varchar'})
    entidade: string;

    @Column({ name: 'entidade_id', type: 'int', nullable: true})
    entidadeId: number | null;

    @Column({ name: 'sucesso', type: 'boolean'})
    sucesso: boolean;

    @Column({ name: 'ocorrido_em', type: 'datetime', insert: false, update: false})
    ocorridoEm: Date;

    @Column({ name: 'ip', type: 'varchar', nullable: true})
    ip: string | null;

    @Column({ name: 'detalhes', type: 'json', nullable: true})
    detalhes: Record<string, unknown> | null;

}