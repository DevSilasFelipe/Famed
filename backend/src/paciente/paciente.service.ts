import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuario/usuario.entity';
import { Paciente } from './paciente.entity';
import { CriarPacienteDto } from './dto/criar-paciente.dto';
import { paraResposta, UsuarioResposta } from '../common/usuario-resposta';

@Injectable()
export class PacienteService {
    constructor(private readonly dataSource: DataSource) {}

    async criar(dto: CriarPacienteDto): Promise<UsuarioResposta> {
        const senhaHash = await bcrypt.hash(dto.senha, 10);

        return this.dataSource.transaction(async (manager) => {
            const usuario = await manager.save(
                manager.create(Usuario, {
                    nome: dto.nome,
                    email: dto.email,
                    senhaHash,
                    perfil: 'PACIENTE',
                    situacao: 'ATIVO'
                }),
        );
        
        await manager.insert(Paciente, {
            usuarioId: usuario.id,
            cpf: dto.cpf,
            dataNascimento: dto.dataNascimento,
            sexo: dto.sexo ?? null,
            cadastradoPor: null,
        });
        return paraResposta(usuario);
        });
    }
}