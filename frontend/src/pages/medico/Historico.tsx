import ListaReceitas from "../../components/ListaReceitas";
import type { ReceitaResumo } from "../../components/ListaReceitas";
import { listarMinhasReceitasMedico } from "../../api/receitas";
import { useCarregamento } from "../../hooks/useCarregamento";
import { useAbrirPdf } from "../../hooks/useAbrirPdf";
import { tipoDaLista } from "../../utils/receitas";

export default function Historico() {
    const { dados, carregando, erro } = useCarregamento(listarMinhasReceitasMedico);
    const { abrirPdf, abrindoPdf, erro: erroPdf } = useAbrirPdf();

    const receitas: ReceitaResumo[] = dados.map((r) => ({
        id: r.receitaId,
        tipo: tipoDaLista(r.lista),
        nome: r.pacienteNome,
        token: r.token,
    }));

    return (
        <ListaReceitas
            receitas={receitas}
            rotulo="Paciente"
            carregando={carregando}
            erro={erro}
            aoExpandir={abrirPdf}
            abrindoPdf={abrindoPdf}
            erroPdf={erroPdf}
        />
    );
}