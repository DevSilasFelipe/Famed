import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('administrador')
export class Administrador {
    @PrimaryColumn({ name: 'usuario_id', type: 'int'})
    usuarioId: number;

    @Column({ name: 'nivel_acesso', type: 'enum', enum: ['ADMIN', 'SUPER_ADMIN'] })
    nivelAcesso: 'ADMIN' | 'SUPER_ADMIN';
}