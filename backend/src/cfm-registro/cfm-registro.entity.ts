import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cfm_registro')
export class CfmRegistro {
    @PrimaryGeneratedColumn()
        id: number;

    @Column({ name: 'crm' })
        crm: string;

    @Column({ name: 'uf' })
        uf: string;

    @Column({ name: 'cpf' })
        cpf: string;

    @Column({ name: 'nome' })
        nome: string;

    @Column({ name: 'situacao', type: 'enum', enum: ['ATIVO', 'SUSPENSO', 'CANCELADO', 'INATIVO'] })
        situacao: 'ATIVO' | 'SUSPENSO' | 'CANCELADO' | 'INATIVO';
}