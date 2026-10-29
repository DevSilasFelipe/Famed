import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { DadosPdf } from './receita-pdf-dados';
import { join } from 'path';


const NORMAL  = 'Helvetica';
const NEGRITO = 'Helvetica-Bold';
const ITALICO = 'Helvetica-Oblique';

const LARGURA_PAGINA = 595.28;
const ALTURA_PAGINA  = 841.89;
const MARGEM = 36;
const LARGURA_UTIL = LARGURA_PAGINA - 2 * MARGEM;
const AZUL = '#000547';

// Parte de baixo de cada página, de cima para baixo: corpo, assinatura digital (centralizada), token/SNCR
const Y_RODAPE = ALTURA_PAGINA - MARGEM - 34;
const Y_ASSINATURA = Y_RODAPE - 58;
const LIMITE_CORPO = Y_ASSINATURA - 16; // o corpo da receita nunca passa daqui

const FONTE_ITEM      = 15; // nome, dosagem e quantidade do medicamento
const FONTE_POSOLOGIA = 12;
const ESPACO_LINHA    = 7; // respiro entre as linhas das caixas do cabeçalho

// Posição das colunas da tabela de medicamentos
const COLUNA = {
    medicamento: { x: MARGEM, largura: 170 },
    dosagem    : { x: 215, largura: 160 },
    quantidade : { x: 385, largura: LARGURA_PAGINA - MARGEM - 385 },
};

type Doc = InstanceType<typeof PDFDocument>;

@Injectable()
export class ReceitaPdfService {
    /** Desenha a receita e devolve o PDF pronto (em memória, nada é gravado em disco). */
    gerar(dados: DadosPdf): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({
                size: 'A4',
                margin: MARGEM,
                bufferPages: true, // necessário para escrever o rodapé em todas as páginas no final.
                info: { Title: `Receita ${dados.token}`, Author: 'Famed' },
            });

            const partes: Buffer[] = [];
            doc.on('data', (parte: Buffer) => partes.push(parte));
            doc.on('end', () => resolve(Buffer.concat(partes)));
            doc.on('error', reject);

            this.desenharCabecalho(doc, dados);
            this.desenharPaciente(doc, dados);
            this.desenharItens(doc, dados);
            this.desenharRodape(doc, dados);

            doc.end();
        });
    }

    // ------------------------------------------------------------ cabeçalho
    private desenharCabecalho(doc: Doc, d: DadosPdf) {
        const larguraLogo = 185;
        doc.image(join(__dirname, 'assets', 'logo.png'), (LARGURA_PAGINA - larguraLogo) / 2, 40, { width: larguraLogo });

        const topo     = 130;
        const esquerda = { x: MARGEM, largura: 241 };
        const direita  = { x: 290, largura: LARGURA_PAGINA - MARGEM - 290 };
        const recuo    = 12;

        // Caixa da esquerda: identificação do emitente
        const xEsq       = esquerda.x + recuo;
        const larguraEsq = esquerda.largura - 2 * recuo;

        doc.y = topo + recuo;
        this.titulo(doc, 'IDENTIFICAÇÃO DO EMITENTE', xEsq, larguraEsq);
        doc.y += 16;
        this.rotuloValor(doc, 'NOME:', d.emitente.nome, xEsq, larguraEsq, 11);
        this.rotuloValor(doc, 'CRM:', d.emitente.crm, xEsq, larguraEsq, 11);
        const fimEsquerda = doc.y;

        // Caixa da direita: receituário e datas
        const xDir       = direita.x + recuo;
        const larguraDir = direita.largura - 2 * recuo;

        doc.y = topo + recuo;
        this.titulo(doc, 'RECEITUÁRIO', xDir, larguraDir);
        doc.y += 8;
        doc.font(NORMAL).fontSize(10.5).text(d.tipo, xDir, doc.y, { width: larguraDir });
        doc.y += ESPACO_LINHA + 3;
        this.rotuloValor(doc, 'DATA:', d.data, xDir, larguraDir, 10.5);
        for (const linha of d.validade) {
            doc.y += ESPACO_LINHA;
            this.rotuloValor(doc, linha.rotulo, linha.valor, xDir, larguraDir, 10.5);
        }
        const fimDireita = doc.y;

        // As duas caixas têm a mesma altura: a do conteúdo mais alto
        const altura = Math.max(fimEsquerda, fimDireita) + recuo - topo;
        doc.lineWidth(0.7).strokeColor('black');
        doc.rect(esquerda.x, topo, esquerda.largura, altura).stroke();
        doc.rect(direita.x, topo, direita.largura, altura).stroke();

        doc.y = topo + altura + 20;
    }

    // ------------------------------------------------------------- paciente
    private desenharPaciente(doc: Doc, d: DadosPdf) {
        this.rotuloValor(doc, 'PACIENTE:', d.paciente.nome, MARGEM, LARGURA_UTIL, 9.5);
        doc.moveDown(0.4);
        this.rotuloValor(doc, 'CPF:', d.paciente.cpf, MARGEM, LARGURA_UTIL, 9.5);
        doc.moveDown(0.4);
        this.rotuloValor(doc, 'ENDEREÇO:', d.paciente.endereco, MARGEM, LARGURA_UTIL, 9.5);
        doc.moveDown(2);
    }

    // ---------------------------------------------------------------- itens
    private desenharItens(doc: Doc, d: DadosPdf) {
        if (d.usoContinuo) {
            doc.font(NEGRITO).fontSize(10).fillColor(AZUL).text('USO CONTÍNUO', MARGEM, doc.y, { width: LARGURA_UTIL });
            doc.fillColor('black');
            doc.moveDown(0.8);
        }

        // Cabeçalho das colunas
        const yCabecalho = doc.y;
        doc.font(ITALICO).fontSize(9);
        doc.text('MEDICAMENTO', COLUNA.medicamento.x, yCabecalho, { width: COLUNA.medicamento.largura });
        doc.text('DOSAGEM', COLUNA.dosagem.x, yCabecalho, { width: COLUNA.dosagem.largura });
        doc.text('QUANTIDADE', COLUNA.quantidade.x, yCabecalho, { width: COLUNA.quantidade.largura });
        doc.y = yCabecalho + 18;

        for (const item of d.itens) {
            // Mede o bloco do item antes de desenhar, para não cortá-lo entre duas páginas
            doc.font(NORMAL).fontSize(FONTE_ITEM);
            const alturaLinha = Math.max(
                doc.heightOfString(item.nome,       { width: COLUNA.medicamento.largura }),
                doc.heightOfString(item.dosagem,    { width: COLUNA.dosagem.largura }),
                doc.heightOfString(item.quantidade, { width: COLUNA.quantidade.largura }),
            );
            doc.fontSize(FONTE_POSOLOGIA);
            const alturaPosologia = doc.heightOfString(item.posologia, { width: LARGURA_UTIL });
            const alturaTotal     = alturaLinha + 6 + alturaPosologia + 22;

            if (doc.y + alturaTotal > LIMITE_CORPO) {
                doc.addPage();
                doc.y = MARGEM;
            }

            const y = doc.y;
            doc.font(NORMAL).fontSize(FONTE_ITEM);
            doc.text(item.nome, COLUNA.medicamento.x, y, { width: COLUNA.medicamento.largura });
            doc.text(item.dosagem, COLUNA.dosagem.x, y, { width: COLUNA.dosagem.largura });
            doc.text(item.quantidade, COLUNA.quantidade.x, y, { width: COLUNA.quantidade.largura });

            const yPosologia = y + alturaLinha + 6;
            doc.fontSize(FONTE_POSOLOGIA).text(item.posologia, MARGEM, yPosologia, { width: LARGURA_UTIL });

            doc.y = yPosologia + alturaPosologia + 22;
        }
    }

    // --------------------------------------------------------------- rodapé

    /** Assinatura Digital, Token, número SNCR e paginação, escritos no fim em todas as páginas. */
    private desenharRodape(doc: Doc, d: DadosPdf) {
        const { start, count } = doc.bufferedPageRange();

        for (let i = 0; i < count; i++) {
            doc.switchToPage(start + i);

            this.desenharAssinatura(doc, d);

            doc.y = Y_RODAPE;
            this.rotuloValor(doc, 'TOKEN:', d.token, MARGEM, 300, 10);
            if (d.numeroSncr) {
                this.rotuloValor(doc, 'Nº SNCR:', d.numeroSncr, MARGEM, 300, 10);
            }

            doc.font(NORMAL).fontSize(8).fillColor('#666666');
            doc.text(`Página ${i + 1} de ${count}`, MARGEM, Y_RODAPE, { width: LARGURA_UTIL, align: 'right' });
            doc.fillColor('black');
        }
    }

    /** Bloco de assinatura digital centralizado, logo acima do token (como nas receitas impressas). */
    private desenharAssinatura(doc: Doc, d: DadosPdf) {
        const larguraLinha = 280;
        const xLinha = (LARGURA_PAGINA -larguraLinha) / 2;
        doc.lineWidth(0.6).strokeColor('#333333');
        doc.moveTo(xLinha, Y_ASSINATURA).lineTo(xLinha + larguraLinha, Y_ASSINATURA).stroke();
        doc.strokeColor('black');

        const centro      = { width: LARGURA_UTIL, align: 'center' as const };
        const assinadoPor = d.assinatura.assinadoPor.replace(/\s+/g, ' '); // garante uma linha só
        doc.font(NORMAL).fontSize(8).fillColor('#333333');
        doc.text(assinadoPor, MARGEM, Y_ASSINATURA + 5, centro);
        doc.fontSize(7);
        doc.text(`Algoritmo: ${d.assinatura.algoritmo}`, MARGEM, doc.y + 2, centro);
        doc.text(`Hash: ${d.assinatura.hash}`, MARGEM, doc.y + 2, centro);
        doc.fillColor('black');
    }
    
    // ------------------------------------------------------------- auxiliares
    private titulo(doc: Doc, texto: string, x: number, largura: number) {
        doc.font(NEGRITO).fontSize(13).fillColor('black').text(texto, x, doc.y, { width: largura });
    }

    /** "ROTULO: valor", com o rótulo em negrito e o valor normal, na mesma linha. */
    private rotuloValor(doc: Doc, rotulo: string, valor: string, x: number, largura: number, tamanho: number) {
        doc.font(NEGRITO).fontSize(tamanho).text(`${rotulo} `, x, doc.y, { width: largura, continued: true });
        doc.font(NORMAL).text(valor, { continued: false });
    }
}