import { useState } from "react";
import { baixarPdfReceita, baixarPdfReceitaPorToken } from "../api/receitas";
import { tokenLogado } from "../auth/sessao";

/**
 * Abre o PDF de uma receita numa nova aba.
 * O window.open tem que rodar de forma síncrona, dentro do clique; se vier depois
 * de um await, o navegador bloqueia o pop-up. Por isso ele é a primeira linha.
 */
export function useAbrirPdf() {
    const [abrindoPdf, setAbrindoPdf] = useState(false);
    const [erro, setErro] = useState("");

    async function abrirComAba(baixar: () => Promise<Blob>) {
        // A aba abre agora, no clique; senão o navegador bloqueia o pop-up depois do await
        const aba = window.open("", "_blank");
        if (!aba) {
            setErro("Permita pop-ups neste site para abrir o PDF.");
            return;
        }

        setErro("");
        setAbrindoPdf(true);
        try {
            const pdf = await baixar();
            const url = URL.createObjectURL(pdf);
            aba.location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 60_000); // libera a memória depois de 1 min
        } catch (falha) {
            aba.close();
            setErro(falha instanceof Error ? falha.message : "Não foi possível abrir o PDF.");
        } finally {
            setAbrindoPdf(false);
        }
    }

    /** Médico e paciente: abre o PDF pelo id da receita. */
    function abrirPdf(receitaId: number) {
        return abrirComAba(() => baixarPdfReceita(receitaId, tokenLogado() ?? undefined));
    }

    /** Farmácia: abre o PDF pelo token da receita. */
    function abrirPdfPorToken(token: string) {
        return abrirComAba(() => baixarPdfReceitaPorToken(token, tokenLogado() ?? undefined));
    }

    function limparErro() {
        setErro("");
    }

    return { abrirPdf, abrirPdfPorToken, abrindoPdf, erro, limparErro };
}