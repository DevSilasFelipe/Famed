import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ListaControle } from "../lista-controle/lista-controle.entity";

@Entity('medicamento')
export class Medicamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nome: string;

    @Column()
    dosagem: string;

    @Column({ name: 'forma_farmaceutica' })
    formaFarmaceutica: string;

    @Column({ name: 'unidade_dose' })
    unidadeDose: string;

    @Column({ name: 'lista_controle_id', type: 'tinyint', unsigned: true })
    listaControleId: number;

    @ManyToOne(() => ListaControle)
    @JoinColumn({ name: 'lista_controle_id' })
    listaControle: ListaControle;

    @Column({ type: 'boolean' })
    ativo: boolean;
}