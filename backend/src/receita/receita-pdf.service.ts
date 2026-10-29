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
const LIMITE_CORPO = ALTURA_PAGINA - MARGEM - 70; // abaixo disso só cabe o rodapé
const AZUL = '#000547';

// Posição das colunas da tabela de medicamentos
const COLUNA = {
    medicamento: { x: MARGEM, largura: 135 },
    dosagem    : { x: 177, largura: 270 },
    quantidade : { x: 461, largura: 98 },
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
        const recuo    = 8;

        // Caixa da esquerda: identificação do emitente
        doc.y = topo + recuo;
        this.titulo(doc, 'IDENTIFICAÇÃO DO EMITENTE', esquerda.x + recuo, esquerda.largura - 2 * recuo);
        doc.moveDown(0.8);
        this.rotuloValor(doc, 'NOME:', d.emitente.nome, esquerda.x + recuo, esquerda.largura - 2 * recuo, 10.5);
        this.rotuloValor(doc, 'CRM:', d.emitente.crm, esquerda.x + recuo, esquerda.largura - 2 * recuo, 10.5);
        const fimEsquerda = doc.y;

        // Caixa da direita: receituário, datas e assinatura digital
        const xDir       = direita.x + recuo;
        const larguraDir = direita.largura - 2 * recuo;

        doc.y = topo + recuo;
        this.titulo(doc, 'RECEITUÁRIO', xDir, larguraDir);
        doc.moveDown(0.3);
        doc.font(NORMAL).fontSize(9.5).text(d.tipo, xDir, doc.y, { width: larguraDir });
        doc.moveDown(0.4);
        this.rotuloValor(doc, 'DATA:', d.data, xDir, larguraDir, 9.5);
        for (const linha of d.validade) {
            this.rotuloValor(doc, linha.rotulo, linha.valor, xDir, larguraDir, 9.5);
        }

        doc.moveDown(0.6);
        doc.font(NORMAL).fontSize(7).fillColor('#333333');
        doc.text(d.assinatura.assinadoPor, xDir, doc.y, { width: larguraDir });
        doc.text(`Algoritmo: ${d.assinatura.algoritmo}`, xDir, doc.y, { width: larguraDir });
        doc.text(`Hash:`, xDir, doc.y, { width: larguraDir });
        doc.fontSize(6.5).text(d.assinatura.hash, xDir, doc.y, { width: larguraDir });
        doc.fillColor('black');
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
        doc.y = yCabecalho + 16;

        for (const item of d.itens) {
            // Mede o bloco do item antes de desenhar, para não cortá-lo entre duas páginas
            doc.font(NORMAL).fontSize(10);
            const alturaLinha = Math.max(
                doc.heightOfString(item.nome,       { width: COLUNA.medicamento.largura }),
                doc.heightOfString(item.dosagem,    { width: COLUNA.dosagem.largura }),
                doc.heightOfString(item.quantidade, { width: COLUNA.quantidade.largura }),
            );
            const alturaPosologia = doc.heightOfString(item.posologia, { width: LARGURA_UTIL });
            const alturaTotal     = alturaLinha + 6 + 11 + alturaPosologia + 16;

            if (doc.y + alturaTotal > LIMITE_CORPO) {
                doc.addPage();
                doc.y = MARGEM;
            }

            const y = doc.y;
            doc.font(NORMAL).fontSize(10);
            doc.text(item.nome, COLUNA.medicamento.x, y, { width: COLUNA.medicamento.largura });
            doc.text(item.dosagem, COLUNA.dosagem.x, y, { width: COLUNA.dosagem.largura });
            doc.text(item.quantidade, COLUNA.quantidade.x, y, { width: COLUNA.quantidade.largura });

            const yPosologia = y + alturaLinha + 6;
            doc.font(ITALICO).fontSize(8).text('POSOLOGIA', MARGEM, yPosologia, { width: LARGURA_UTIL });
            doc.font(NORMAL).fontSize(10).text(item.posologia, MARGEM, yPosologia + 11, { width: LARGURA_UTIL });

            doc.y = yPosologia + 11 + alturaPosologia + 16;
        }
    }

    // --------------------------------------------------------------- rodapé

    /** Token, número SNCR e paginação, escritos no fim em todas as páginas. */
    private desenharRodape(doc: Doc, d: DadosPdf) {
        const { start, count } = doc.bufferedPageRange();
        const yRodape = ALTURA_PAGINA - MARGEM - 34;

        for (let i = 0; i < count; i++) {
            doc.switchToPage(start + 1);

            doc.y = yRodape;
            this.rotuloValor(doc, 'TOKEN:', d.token, MARGEM, 300, 10);
            if (d.numeroSncr) {
                this.rotuloValor(doc, 'Nº SNCR:', d.numeroSncr, MARGEM, 300, 10);
            }

            doc.font(NORMAL).fontSize(8).fillColor('#666666');
            doc.text(`Página ${i + 1} de ${count}`, MARGEM, yRodape, { width: LARGURA_UTIL, align: 'right' });
            doc.fillColor('black');
        }
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