import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { iniciarSessao, perfilLogado, rotaInicial } from "../auth/sessao";
import type { Perfil } from "../auth/sessao";
import styles from "./Login.module.css";

const contasDeTeste: Record<string, { senha: string; perfil: Perfil }> = {
    "teste@medico.com": { senha: "123", perfil: "medico" },
    "teste@farmacia.com": { senha: "123", perfil: "farmacia" },
    "teste@paciente.com": { senha: "123", perfil: "paciente" },
};

export default function Login() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const navigate = useNavigate();

    const perfilAtual = perfilLogado();
    if (perfilAtual) {
    return <Navigate to={rotaInicial[perfilAtual]} replace />;
    }

    function entrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const conta = contasDeTeste[usuario.trim().toLowerCase()];
    if (!conta || conta.senha !== senha) {
        setErro("Usuário ou senha inválidos.");
        return;
    }

    iniciarSessao(conta.perfil);
    navigate(rotaInicial[conta.perfil], { replace: true });
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
            <label htmlFor="usuario">E-mail ou CNPJ</label>
            <input
                id="usuario"
                type="text"
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

            <button type="submit" className={styles.botao}>
            Entrar
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