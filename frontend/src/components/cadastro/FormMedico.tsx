import type { FormEvent } from "react";
import { ufs } from "../../data/ufs";
import { useFormulario } from "../../hooks/useFormulario";
import { somenteNumeros } from "../../utils/formatadores";
import Campo from "./Campo";
import CamposSenha from "./CamposSenha";
import estilos from "./FormCadastro.module.css";
import { useRef, useState } from "react";
import { post, ErroApi } from "../../api/api";
import { gerarParDeChaves, baixarArquivo, type ParDeChaves } from "../../utils/chaves";

interface FormProps {
    aoConcluir: () => void;
}

const inicial = {
    nome: "",
    crm: "",
    ufCrm: "",
    cpf: "",
    email: "",
    endereco: "",
    senha: "",
    confirmarSenha: "",
};

export default function FormMedico({ aoConcluir }: FormProps) {
    const { valores, atualizar, definir } = useFormulario(inicial);
    const [erro, setErro] = useState("");
    const [enviando, setEnviando] = useState(false);
    const chaves = useRef<ParDeChaves | null>(null);
    const [etapa, setEtapa] = useState<"dados" | "chave">("dados");
    const baixou = useRef(false);

    function montarCorpo(publica: string) {
        return {
            nome        : valores.nome,
            email       : valores.email,
            senha       : valores.senha,
            cpf         : valores.cpf,
            crm         : valores.crm, 
            uf          : valores.ufCrm,
            endereco    : valores.endereco,
            chavePublica: publica, 
        }
    }

    async function validar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro("");

        if (valores.senha !== valores.confirmarSenha) {
            setErro("As senhas não conferem.");
            return;
        }

        setEnviando(true);
        try {
            if (!chaves.current) chaves.current = await gerarParDeChaves();
            await post("/medicos/validar", montarCorpo(chaves.current.publica));
            setEtapa("chave");
        } catch (err) {
            setErro(err instanceof ErroApi ? err.message : "Erro inesperado.");
        } finally {
            setEnviando(false)
        }

    }

    async function concluir() {
        const par = chaves.current;
        if (!par) return;
        setErro("");
        setEnviando(true);

        try {
            if (!baixou.current) {
                baixarArquivo(`famed-chave-privada-crm${valores.crm}-${valores.ufCrm}.pem`, par.privada);
                baixou.current = true;
            }
            await post("/medicos", montarCorpo(par.publica));
            alert("Cadastro realizado! Guarde o arquivo da chave privada em local seguro.");
            aoConcluir();
        } catch (err) {
            setErro(err instanceof ErroApi ? err.message : "Erro inesperado.");
        } finally {
            setEnviando(false);
        }
    }

    if (etapa === "chave") {
        return (
            <div>
                <p className={estilos.aviso}>
                    Seus dados foram validados. Ao clicar no botão abaixo, o arquivo da sua chave
                    privada (.pem) será baixado e o cadastro será concluído. Esse arquivo serve para
                    assinar suas receitas, não é guardado pelo sistema e não pode ser recuperado.
                </p>
                {erro && <p role="alert" className={estilos.erro}>{erro}</p>}
                <button type="button" 
                className={`${estilos.botao} ${estilos.botaoLongo}`}
                onClick={concluir} 
                disabled={enviando}>
                    {enviando ? "Enviando..." : "Baixar chave e Concluir"}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={validar}>
            <Campo id="nome" rotulo="Nome Completo">
            <input id="nome" name="nome" type="text" value={valores.nome} onChange={atualizar} required />
            </Campo>
    
            <div className={estilos.linha}>
            <Campo id="crm" rotulo="CRM" className={estilos.expande}>
                <input
                id="crm"
                name="crm"
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={valores.crm}
                onChange={(e) => definir("crm", somenteNumeros(e.target.value))}
                required
                />
            </Campo>
    
            <Campo id="ufCrm" rotulo="UF CRM" className={estilos.pequeno}>
                <select id="ufCrm" name="ufCrm" value={valores.ufCrm} onChange={atualizar} required>
                <option value="" disabled>UF</option>
                {ufs.map((sigla) => (
                    <option key={sigla} value={sigla}>
                    {sigla}
                    </option>
                ))}
                </select>
            </Campo>
            </div>
    
            <Campo id="cpf" rotulo="CPF">
            <input
                id="cpf"
                name="cpf"
                type="text"
                inputMode="numeric"
                minLength={11}
                maxLength={11}
                value={valores.cpf}
                onChange={(e) => definir("cpf", somenteNumeros(e.target.value))}
                required
            />
            </Campo>
    
            <Campo id="email" rotulo="E-mail">
            <input id="email" name="email" type="email" value={valores.email} onChange={atualizar} required />
            </Campo>
    
            <Campo id="endereco" rotulo="Endereço de Atendimento">
            <input id="endereco" name="endereco" type="text" value={valores.endereco} onChange={atualizar} required />
            </Campo>
    
            <CamposSenha
            senha={valores.senha}
            confirmarSenha={valores.confirmarSenha}
            aoMudar={atualizar}
            />

            {erro && <p role="alert" className={estilos.erro}>{erro}</p>}
            <button type="submit" className={estilos.botao} disabled={enviando}>
                {enviando ? "Enviando..." : "Continuar"}
            </button>
        </form>
    );
}