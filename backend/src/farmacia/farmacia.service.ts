import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuario/usuario.entity';
import { Farmacia } from './farmacia.entity';
import { CriarFarmaciaDto } from './dto/criar-farmacia.dto';
import { CnpjProvider } from './cnpj.provider';
import { paraResposta, UsuarioResposta } from '../common/usuario-resposta';

@Injectable()
export class FarmaciaService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly cnpjProvider: CnpjProvider,
    ) {}

    async criar(dto: CriarFarmaciaDto): Promise<UsuarioResposta> {
        const info = await this.cnpjProvider.consultar(dto.cnpj);

        if (!info) {
            throw new UnprocessableEntityException('CNPJ não encontrado.');
        }
        if (info.descricao_situacao_cadastral !== 'ATIVA') {
            throw new UnprocessableEntityException('CNPJ não está ativo.');
        }
        if (!String(info.cnae_fiscal).startsWith('47717')) {
            throw new UnprocessableEntityException('CNAE principal não é de farmácia (4771-7)');
        }

        const senhaHash = await bcrypt.hash(dto.senha, 10);

        return this.dataSource.transaction(async (manager) => {
            const usuario = await manager.save(
                manager.create(Usuario, {
                    nome: info.nome_fantasia || info.razao_social,
                    email: dto.email,
                    senhaHash,
                    perfil: 'FARMACIA',
                    situacao: 'ATIVO',
                }),
            );

            await manager.insert(Farmacia, {
                usuarioId: usuario.id,
                cnpj: dto.cnpj,
                razaoSocial: info.razao_social,
                cnae: String(info.cnae_fiscal),
            });

            return paraResposta(usuario);
        });
    }   
}