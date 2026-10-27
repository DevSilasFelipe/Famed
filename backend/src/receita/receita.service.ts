import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { DataSource, In } from "typeorm";
import { PrepararReceitaDto } from "./dto/preparar-receita.dto";
import { EmitirReceitaDto } from "./dto/emitir-receita.dto";
import { Medico } from "../medico/medico.entity";
import { Usuario } from "../usuario/usuario.entity";
import { Paciente } from "../paciente/paciente.entity";
import { Receita } from "./receita.entity";
import { ItemReceita } from "./item-receita.entity";
import { 
    ListaCodigo,
    calcularDataValidade,
    calcularQuantidade,
    determinarLista,
    duracaoEfetiva,
    gerarPosologia,
    regra 
} from "./receita-calculo";
import { Medicamento } from "../medicamento/medicamento.entity";
import { formaExigeQuantidadeManual } from "../medicamento/forma-farmaceutica";
import { createHash, createVerify, randomInt } from "crypto";

const ALFABETO_TOKEN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SELO_VALIDADE_SEGUNDOS = 10 * 60;

interface SeloReceita {
    tipo: 'SELO_RECEITA';
    medicoId: number;
    token: string;
    emitidaEm: string; // ISO 8601 (UTC)
}

interface ItemMontado {
    medicamentoId: number;
    nome: string;
    dosagem: string;
    quantidade: number;
    duracaoDias: number;
    dose: number;
    intervaloValor: number;
    intervaloUnidade: 'HORAS' | 'DIAS' | 'SEMANAS';
    condicaoUso: string | null;
    posologia: string;
}

@Injectable()
export class ReceitaService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly jwt: JwtService,
        private readonly config: ConfigService,
    ) {}

    /** Valida, calcula e devolve o texto a ser assinado. Não grava nada no banco. */
    async preparar(dto: PrepararReceitaDto, medicoId: number) {
        const token = await this.gerarTokenUnico();
        const emitidaEm = new Date(Math.floor(Date.now() / 1000) * 1000); // DATETIME não guarda ms

        const dados = await this.montar(dto, medicoId, token, emitidaEm);

        const selo = await this.jwt.signAsync(
            { tipo: 'SELO_RECEITA', medicoId, token, emitidaEm: emitidaEm.toISOString() } satisfies SeloReceita,
            { secret: this.segredoSelo(), expiresIn: SELO_VALIDADE_SEGUNDOS },
        );

        return {
            textoCanonico: dados.canonico,
            hash: dados.hash,
            selo, 
            resumo: {
                lista: dados.lista,
                usoContinuo: dto.usoContinuo,
                dataValidade: dados.dataValidade,
                validadePrimeiraCompra: dados.validadePrimeiraCompra,
                paciente: {
                    nome    : dados.paciente.nome,
                    cpf     : dto.pacienteCpf,
                    endereco: dados.paciente.endereco,
                },
                itens: dados.itens.map((i) => ({
                    medicamentoId: i.medicamentoId,
                    nome         : i.nome,
                    dosagem      : i.dosagem,
                    quantidade   : i.quantidade,
                    duracaoDias  : i.duracaoDias,
                    posologia    : i.posologia,
                })),
            },
        };
    }

    /** Remonta o texto, confere a assinatura com a chave pública do médico e grava a receita. */
    async emitir(dto: EmitirReceitaDto, medicoId: number) {
        const selo = await this.lerSelo(dto.selo, medicoId);
        const dados = await this.montar(dto, medicoId, selo.token, new Date(selo.emitidaEm));

        if (!this.assinaturaValida(dados.canonico, dto.assinatura, dados.medico.chavePublica)) {
            throw regra('Assinatura digital inválida: o conteúdo assinado não confere com a receita.');
        }

        const receita = await this.dataSource.transaction(async (manager) => {
            const salva = await manager.save(
                manager.create(Receita, {
                    medicoId,
                    pacienteId: dados.paciente.id,
                    listaControleId: dados.listaControleId,
                    usoContinuo: dto.usoContinuo,
                    token: selo.token,
                    numeroSncr: null,
                    emitidaEm: new Date(selo.emitidaEm),
                    dataValidade: dados.dataValidade,
                    hashSha256: dados.hash,
                    assinaturaDigital: dto.assinatura,
                    medicoNome: dados.medico.nome,
                    pacienteNome: dados.paciente.nome,
                    pacienteEndereco: dados.paciente.endereco,
                }),
            );

            await manager.insert(
                ItemReceita,
                dados.itens.map((i) => ({
                    receitaId: salva.id,
                    medicamentoId: i.medicamentoId,
                    quantidade: i.quantidade,
                    duracaoDias: i.duracaoDias,
                    dose: i.dose,
                    intervaloValor: i.intervaloValor,
                    intervaloUnidade: i.intervaloUnidade,
                    condicaoUso: i.condicaoUso,
                    posologia: i.posologia,
                })),
            );

            return salva;
        });

        return {
            id: receita.id,
            token: receita.token,
            lista: dados.lista,
            emitidaEm: receita.emitidaEm,
            dataValidade: receita.dataValidade,
            hash: receita.hashSha256,
        }
    }

    // ---------------------------------------------------------------- internos

    /** Fonte única do conteúdo da receita: preparar e emitir passam por aqui. */
    private async montar(dto: PrepararReceitaDto, medicoId: number, token: string, emitidaEm: Date) {
        const medico = await this.dataSource.getRepository(Medico).findOneBy({ usuarioId: medicoId });
        const usuarioMedico = await this.dataSource.getRepository(Usuario).findOneBy({ id: medicoId });
        if (!medico || !usuarioMedico) throw regra('Médico não encontrado.');
        if (usuarioMedico.situacao === 'INATIVO') throw regra('Médico inativo não pode emitir receitas.');

        const pacienteBase = await this.dataSource.getRepository(Paciente).findOneBy({ cpf: dto.pacienteCpf });
        if (!pacienteBase) {
            throw new NotFoundException({ statusCode: 404, message: 'Paciente não encontrado para o CPF informado.' });
        }
        const usuarioPaciente = await this.dataSource.getRepository(Usuario).findOneBy({ id: pacienteBase.usuarioId });
        if (!usuarioPaciente) throw regra('Paciente não encontrado.');
        if (usuarioPaciente.situacao === 'INATIVO') throw regra('Paciente inativo.');

        const endereco = usuarioPaciente.endereco?.trim();
        if (!endereco) throw regra('Paciente sem endereço cadastrado: atualize o cadastro antes de emitir a receita.');
        
        const ids = dto.itens.map((i) => i.medicamentoId);
        if (new Set(ids).size !== ids.length) throw regra('O mesmo medicamento aparece mais de uma vez na receita.');
    
        const medicamentos = await this.dataSource.getRepository(Medicamento).find({
            where: { id: In(ids) },
            relations: { listaControle: true},
        });
        const porId = new Map(medicamentos.map((m) => [m.id, m]));

        const itens: ItemMontado[] = dto.itens.map((item) => {
            const med = porId.get(item.medicamentoId);
            if (!med) throw regra(`Medicamento ${item.medicamentoId} não encontrado.`);

            const rotulo = `${med.nome} ${med.dosagem}`;
            if (!med.ativo) throw regra(`${rotulo} está inativo e não pode ser prescrito.`);

            const dias = duracaoEfetiva(
                med.listaControle.codigo as ListaCodigo,
                dto.usoContinuo,
                item.duracaoDias,
                rotulo,
            );

            let quantidade: number;
            if (formaExigeQuantidadeManual(med.formaFarmaceutica)) {
                if (item.quantidade === undefined) {
                    throw regra(`Informe a quantidade de frascos de ${rotulo}.`);
                }
                quantidade = item.quantidade;
            } else {
                if (item.quantidade !== undefined) {
                    throw regra(`${rotulo}: a quantidade é calculada automaticamente, não informe.`);
                }
                quantidade = calcularQuantidade(item.dose, item.intervaloValor, item.intervaloUnidade, dias, rotulo);
            }

            return {
                medicamentoId: med.id,
                nome: med.nome,
                dosagem: med.dosagem,
                quantidade,
                duracaoDias: dias,
                dose: item.dose,
                intervaloValor: item.intervaloValor,
                intervaloUnidade: item.intervaloUnidade,
                condicaoUso: item.condicaoUso ?? null,
                posologia: gerarPosologia({
                    dose: item.dose,
                    unidadeDose: med.unidadeDose,
                    intervaloValor: item.intervaloValor,
                    intervaloUnidade: item.intervaloUnidade,
                    dias,
                    condicaoUso: item.condicaoUso,
                }),
            };
        });
        
        const codigos = medicamentos.map((m) => m.listaControle.codigo as ListaCodigo);
        const lista = determinarLista(codigos);
        const listaEntidade = medicamentos.find((m) => m.listaControle.codigo === lista)!.listaControle;

        const dataValidade = calcularDataValidade(
            emitidaEm,
            listaEntidade.validadeDias,
            listaEntidade.usoContinuoMaxDias,
            dto.usoContinuo,
        );

        // Prazo da 1ª compra: só a validade da lista, sem a janela do uso contínuo.
        // É derivado de dados que já existem: não entra no texto assinado nem em coluna alguma.
        const validadePrimeiraCompra = calcularDataValidade(emitidaEm, listaEntidade.validadeDias, null, false);

        // Ordem dos campos fixa: o JSON abaixo é exatamente o que o médico assina.
        const canonico = JSON.stringify({
            versao: 1,
            token, 
            emitidaEm: emitidaEm.toISOString(),
            medico: { id: medicoId, nome: usuarioMedico.nome, crm: medico.crm, uf:medico.uf },
            paciente: { id: pacienteBase.usuarioId, nome: usuarioPaciente.nome, cpf: pacienteBase.cpf, endereco },
            lista,
            usoContinuo: dto.usoContinuo,
            dataValidade,
            itens,
        });
        const hash = createHash('sha256').update(canonico, 'utf8').digest('hex');

        return {
            canonico, 
            hash,
            lista,
            listaControleId: listaEntidade.id,
            dataValidade,
            validadePrimeiraCompra,
            itens,
            medico: { nome: usuarioMedico.nome, chavePublica: medico.chavePublica },
            paciente: { id: pacienteBase.usuarioId, nome: usuarioPaciente.nome, endereco },
        };
    }

    private async gerarTokenUnico(): Promise<string> {
        const repo = this.dataSource.getRepository(Receita);
        for (let tentativa = 0; tentativa < 5; tentativa++) {
            let token = '';
            for (let i = 0; i < 6; i++) token += ALFABETO_TOKEN[randomInt(ALFABETO_TOKEN.length)];
            if (!(await repo.existsBy({ token }))) return token;
        }
        throw regra('Não foi possível gerar o token da receita. Tente novamente.');
    }

    private async lerSelo(selo: string, medicoId: number): Promise<SeloReceita> {
        let payload: SeloReceita;
        try {
            payload = await this.jwt.verifyAsync<SeloReceita>(selo, { secret: this.segredoSelo() });
        } catch {
            throw regra('Selo inválido ou expirado. Prepare a receita novamente.');
        }
        if (payload.tipo !== 'SELO_RECEITA' || payload.medicoId !== medicoId) {
            throw regra('Selo inválido. Prepare a receita novamente.');
        }
        return payload;
    }

    // Segredo próprio do selo: um token de login nunca vale como selo, nem o contrário.
    private segredoSelo(): string {
        return `${this.config.getOrThrow<string>('JWT_SECRET')}:selo-receita`;
    }

    private assinaturaValida(texto: string, assinaturaBase64: string, chavePublicaPem: string): boolean {
        try {
            return createVerify('RSA-SHA256')
                .update(texto, 'utf8')
                .verify(chavePublicaPem, assinaturaBase64, 'base64');
        } catch {
            return false;
        }
    }
}