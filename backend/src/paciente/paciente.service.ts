import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuario/usuario.entity';
import { Paciente } from './paciente.entity';
import { CriarPacienteDto } from './dto/criar-paciente.dto';
import { CriarPacientePorMedicoDto } from './dto/criar-paciente-por-medico.dto';
import { paraResposta, UsuarioResposta } from '../common/usuario-resposta';

@Injectable()
export class PacienteService {
    constructor(private readonly dataSource: DataSource) {}

    async criar(dto: CriarPacienteDto): Promise<UsuarioResposta> {
        const senhaHash = await bcrypt.hash(dto.senha, 10);

        return this.dataSource.transaction(async (manager) => {

            const existente = await manager.findOneBy(Paciente, { cpf: dto.cpf });

            if (existente) {
                if (existente.dataNascimento !== dto.dataNascimento) {
                    throw this.conflito();
                }

                const resultado = await manager.update(
                    Usuario,
                    { id: existente.usuarioId, situacao: 'PENDENTE' },
                    { email: dto.email, senhaHash, situacao: 'ATIVO', endereco : dto.endereco },
                );
                if (resultado.affected !== 1) {
                    throw this.conflito();
                }

                const completo = await manager.findOneByOrFail(Usuario, { 
                    id: existente.usuarioId,
                });
                return paraResposta(completo)
            }

            const usuario = await manager.save(
                manager.create(Usuario, {
                    nome: dto.nome,
                    email: dto.email,
                    senhaHash,
                    perfil: 'PACIENTE',
                    situacao: 'ATIVO',
                    endereco: dto.endereco
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

    private conflito() {
        return new ConflictException({
            statusCode: 409,
            message: 'Já existe um registro com esse valor',
        });
    }



    async criarPorMedico(
        dto: CriarPacientePorMedicoDto,
        medicoId: number,
    ): Promise<UsuarioResposta> {
        return this.dataSource.transaction(async (manager) => {
            const usuario = await manager.save(
                manager.create(Usuario, {
                    nome: dto.nome,
                    email: null,
                    senhaHash: null,
                    perfil: 'PACIENTE',
                    situacao: 'PENDENTE',
                    endereco: dto.endereco
                }),
            );
            await manager.insert(Paciente, {
                usuarioId: usuario.id,
                cpf: dto.cpf,
                dataNascimento: dto.dataNascimento,
                sexo: dto.sexo ?? null,
                cadastradoPor: medicoId,
            });

            return paraResposta(usuario);
        });
    }
}