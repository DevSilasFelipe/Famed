import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { iniciarSessao, paraPerfil, perfilLogado, rotaInicial } from "../auth/sessao";
import styles from "./Login.module.css";
import { post, ErroApi } from "../api/api";


export default function Login() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const perfilAtual = perfilLogado();
    const [enviando, setEnviando] = useState(false);

    if (perfilAtual) {
    return <Navigate to={rotaInicial[perfilAtual]} replace />;
    }

    async function entrar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro("")
        setEnviando(true);

        try {
            const resposta = await post<{ accessToken: string; perfil: string }>("/auth/login", {
                email: usuario.trim(),
                senha,
            });

            const perfil = paraPerfil(resposta.perfil);
            if (!perfil) {
                setErro("Esse perfil ainda não tem acesso pelo site.");
                return;
            }
    
            iniciarSessao(perfil, resposta.accessToken);
            navigate(rotaInicial[perfil], { replace: true });
        } catch (err) {
            setErro(err instanceof ErroApi ? err.message : "Erro inesperado.");
        } finally {
            setEnviando(false);
        }

    }

    return (
    <main className={styles.pagina}>
        <section className={styles.caixa}>
        <img
            src="/img/logoprincipalmenor.png"
            alt="Logo Famed"
            className={styles.logo}
        />

        <form className={styles.form} onSubmit={entrar}>
            <div className={styles.campo}>
            <label htmlFor="usuario">E-mail</label>
            <input
                id="usuario"
                type="email"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
            />
            </div>

            <div className={styles.campo}>
            <div className={styles.linhaSenha}>
                <label htmlFor="senha">Senha</label>
                {}
                <a href="#">Esqueci minha senha</a>
            </div>
            <input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
            />
            </div>

            {erro && (
            <p className={styles.erro} role="alert">
                {erro}
            </p>
            )}

            <button type="submit" className={styles.botao} disabled={enviando}>
                {enviando ? "Entrando..." : "Entrar"}
            </button>
        </form>

        <p className={styles.rodape}>
            Ainda não tem conta? <Link to="/cadastro">Cadastre-se</Link>
            <br />
            <Link to="/">Voltar</Link>
        </p>
        </section>
    </main>
    );
}