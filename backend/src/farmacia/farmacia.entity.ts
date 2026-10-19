import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('farmacia')
export class Farmacia {
    @PrimaryColumn({ name: 'usuario_id' })
    usuarioId: number;

    @Column({ name: 'cnpj' })
    cnpj: string;

    @Column({ name: 'razao_social' })
    razaoSocial: string;

    @Column({ name: 'cnae' })
    cnae: string;
}