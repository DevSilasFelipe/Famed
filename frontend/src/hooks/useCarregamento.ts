import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ErroApi } from "../api/api";
import { encerrarSessao, tokenLogado } from "../auth/sessao";

/** Carrega uma lista da API ao abrir a tela e devolve { dados, carregando, erro }. */
export function useCarregamento<T>(buscar: (token?: string) => Promise<T[]>) {
    const [dados, setDados] = useState<T[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        let ativo = true; // evita atualizar a tela se ela já foi fechada

        buscar(tokenLogado() ?? undefined)
            .then((resultado) => {
                if (ativo) setDados(resultado);
            })
            .catch((falha) => {
                if (!ativo) return;
                if (falha instanceof ErroApi && falha.status === 401) {
                    encerrarSessao();
                    alert("Sua sessão expirou. Entre novamente.");
                    navigate("/login", { replace: true });
                    return;
                }
                setErro(falha instanceof ErroApi ? falha.message : "Não foi possível carregar os dados.");
            })
            .finally(() => {
                if (ativo) setCarregando(false);
            });

        return () => {
            ativo = false;
        };
    }, [buscar, navigate]);

    return { dados, carregando, erro };
}