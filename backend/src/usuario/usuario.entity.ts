import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('usuario')
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nome' })
    nome: string;

    @Column({ name: 'email', type: 'varchar', nullable: true })
    email: string | null;

    @Column({ name: 'senha_hash', type: 'varchar', nullable: true, select: false })
    senhaHash: string | null;

    @Column({ name: 'perfil', type: 'enum', enum: ['MEDICO', 'PACIENTE', 'FARMACIA', 'ADMINISTRADOR'] })
    perfil: 'MEDICO' | 'PACIENTE' | 'FARMACIA' | 'ADMINISTRADOR';

    @Column({ name: 'situacao', type: 'enum', enum: ['PENDENTE', 'ATIVO', 'INATIVO'] })
    situacao: 'PENDENTE' | 'ATIVO' | 'INATIVO';
    
    @Column({ name: 'telefone', type: 'varchar', nullable: true})
    telefone: string | null;
    
    @Column({ name: 'endereco', type: 'varchar', nullable: true})
    endereco: string | null;
    
    @Column({ name: 'criado_em', type: 'datetime', insert: false, update: false})
    criadoEm: Date;
    
    @Column({ name: 'atualizado_em', type: 'datetime', insert: false, update: false})
    atualizadoEm: Date;
}