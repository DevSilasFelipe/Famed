import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('medico')
export class Medico {
    @PrimaryColumn({ name: 'usuario_id' })
    usuarioId: number;

    @Column({ name: 'cpf' })
    cpf: string;

    @Column({ name: 'crm' })
    crm: string;

    @Column({ name: 'uf' })
    uf: string;

    @Column({ name: 'chave_publica', type: 'text' })
    chavePublica: string;
}