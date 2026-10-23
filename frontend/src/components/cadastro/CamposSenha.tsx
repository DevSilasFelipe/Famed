import type { ChangeEvent } from "react";
import Campo from "./Campo";
import estilos from "./FormCadastro.module.css";

interface CampoSenhaProps {
    senha: string;
    confirmarSenha: string;
    aoMudar: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export default function CamposSenha({ senha, confirmarSenha, aoMudar}: CampoSenhaProps) {
    return (
        <div className={estilos.linha}>
            <Campo id="senha" rotulo="Senha" className={estilos.expande}>
                <input
                    id="senha"
                    name="senha"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={senha}
                    onChange={aoMudar}
                    required
                />
            </Campo>

            <Campo id="confirmarSenha" rotulo="Confirmar senha" className={estilos.expande}>
                <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    value={confirmarSenha}
                    onChange={aoMudar}
                    required
                />
            </Campo>
        </div>
    )
}