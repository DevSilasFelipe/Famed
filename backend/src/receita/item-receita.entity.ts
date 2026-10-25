import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('item_receita')
export class ItemReceita {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'receita_id', type: 'int' })
    receitaId: number;

    @Column({ name: 'medicamento_id', type: 'int' })
    medicamentoId: number;

    @Column({ name: 'quantidade', type: 'smallint', unsigned: true })
    quantidade: number;

    @Column({ name: 'duracao_dias', type: 'smallint', unsigned: true, nullable: true })
    duracaoDias: number | null;

    @Column({
        name: 'dose',
        type: 'decimal',
        precision: 6,
        scale: 2,
        transformer: { to: (v: number) => v, from: (v: string) => Number(v) },
    })
    dose: number;

    @Column({ name: 'intervalo_valor', type: 'smallint', unsigned: true })
    intervaloValor: number;

    @Column({ name: 'intervalo_unidade', type: 'enum', enum: ['HORAS', 'DIAS', 'SEMANAS'] })
    intervaloUnidade: 'HORAS' | 'DIAS' | 'SEMANAS';

    @Column({ name: 'condicao_uso', type: 'varchar', length: 60, nullable: true })
    condicaoUso: string | null;

    @Column({ name: 'posologia', type: 'varchar', length: 255 })
    posologia: string;
}