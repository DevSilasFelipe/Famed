import { useState } from "react";
import { baixarPdfReceita } from "../api/receitas";
import { tokenLogado } from "../auth/sessao";


 //Abre o PDF de uma receita numa nova aba.
 //O window.open tem que rodar de forma síncrona, dentro do clique; se vier depois
 //de um await, o navegador bloqueia o pop-up. Por isso ele é a primeira linha.
 export function useAbrirPdf() {
    const [abrindoPdf, setAbrindoPdf] = useState(false);
    const [erro, setErro] = useState("");

    async function abrirPdf(receitaId: number) {

        const aba = window.open("", "_blank");
        if (!aba) {
            setErro("Permita pop-ups neste site para abrir o PDF");
            return
        }

        setErro("");
        setAbrindoPdf(true)
        try {
            const pdf = await  baixarPdfReceita(receitaId, tokenLogado() ?? undefined);
            const url =  URL.createObjectURL(pdf);
            aba.location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 60_000);
        } catch (falha) {
            aba.close()
            setErro(falha instanceof Error ? falha.message : "Não foi possível abrir o PDF.");
        } finally {
            setAbrindoPdf(false);
        }
    }

    function limparErro() {
        setErro("");
    }

    return { abrirPdf, abrindoPdf, erro, limparErro };
 }
