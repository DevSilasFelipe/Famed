import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('lista_controle')
export class ListaControle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    codigo: string;

    @Column()
    descricao: string;

    @Column({ name: 'validade_dias', type: 'smallint', unsigned: true, nullable: true})
    validadeDias: number | null;
    
    @Column({ name: 'uso_continuo_max_dias', type: 'smallint', unsigned: true, nullable: true})
    usoContinuoMaxDias: number | null;
}