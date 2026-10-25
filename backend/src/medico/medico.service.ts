import { BadRequestException, ConflictException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { createPublicKey, KeyObject } from 'crypto';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuario/usuario.entity';
import { Medico } from './medico.entity';
import { CfmRegistro } from '../cfm-registro/cfm-registro.entity';
import { CriarMedicoDto } from './dto/criar-medico.dto';
import { paraResposta, UsuarioResposta } from '../common/usuario-resposta';

@Injectable()
export class MedicoService {
    constructor(private readonly dataSource: DataSource) {}

    async criar(dto: CriarMedicoDto): Promise<UsuarioResposta> {

        await this.validar(dto);

        const senhaHash = await bcrypt.hash(dto.senha, 10);

        return this.dataSource.transaction(async (manager) => {
            const usuario = await manager.save(
                manager.create(Usuario, {
                    nome: dto.nome,
                    email: dto.email,
                    senhaHash,
                    perfil: 'MEDICO',
                    situacao: 'ATIVO',
                    endereco: dto.endereco
                }),
            );

            await manager.insert(Medico, {
                usuarioId: usuario.id,
                cpf: dto.cpf,
                crm: dto.crm,
                uf: dto.uf,
                chavePublica: dto.chavePublica.trim(),
            });

            return paraResposta(usuario);
        });
    }

    async validar(dto:CriarMedicoDto): Promise<void> {
        this.validarChavePublica(dto.chavePublica);

        const registro = await this.dataSource.getRepository(CfmRegistro).findOneBy({
            cpf: dto.cpf,
            crm: dto.crm,
            uf:  dto.uf,
        });
        if (!registro) {
            throw new UnprocessableEntityException(
                'Medico não encontrado no registro do CFM: CPF, CRM e UF não conferem',
            );
        }
        if (registro.situacao !== 'ATIVO') {
            throw new UnprocessableEntityException('Registro não ativo no CFM');
        }

        const emailEmUso   = await this.dataSource.getRepository(Usuario).existsBy({ email: dto.email });
        const medicoExiste = await this.dataSource
            .getRepository(Medico)
            .existsBy([{ cpf: dto.cpf}, { crm: dto.crm, uf: dto.uf}]);
        
        if (emailEmUso || medicoExiste) {
            throw new ConflictException('Já existe um registro com esse valor');
        }
    }

    private validarChavePublica(pem: string): void {
        if (/PRIVATE KEY/i.test(pem)) {
            throw new BadRequestException(
                'Envie apenas a chave pública. A chave privada nunca deve ser enviada',
            );
        }

        let chave: KeyObject;
        try {
            if (!/-----BEGIN (RSA )?PUBLIC KEY-----/.test(pem)) throw new Error();
            chave = createPublicKey(pem);
            if (chave.asymmetricKeyType !== 'rsa') throw new Error();
        } catch {
            throw new BadRequestException(
                'Chave pública inválida: envie uma chave RSA pública em formato PEM'
            );
        }

        if ((chave.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) {
            throw new BadRequestException('Chave RSA muito curta: use no mínimo 2048 bits');
        }
    }
}