/**
 * Cliente HTTP do front-end: concentra a comunicação com o backend.
 * Monta a URL a partir de VITE_API_URL e converte falhas em ErroApi,
 * para que as telas só precisem de try/catch e mostrem a mensagem.
 */
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

/** Erro de comunicação com a API: `message` é o texto para o usuário e `status` o código HTTP (0 = sem conexão). */
export class ErroApi extends Error {
    status: number;

    constructor(mensagem: string, status: number) {
        super(mensagem);
        this.status = status;
    }
}

/**
 * Envia um POST em JSON para o backend e devolve o corpo da resposta.
 * Se `token` for informado, envia o cabeçalho Authorization (Bearer).
 * Lança ErroApi quando o servidor recusa o pedido (status 4xx/5xx,
 * com a mensagem do backend) ou não responde (status 0).
 */
export async function post<T>(rota: string, corpo: unknown, token?: string) : Promise<T> {
    let resposta: Response;
    try {
        resposta = await fetch(`${API_URL}${rota}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(corpo),
        });
    } catch {
        throw new ErroApi("Não foi possível conectar ao servidor.", 0);
    }

    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
        const msg = dados?.message;
        const texto = Array.isArray(msg) ? msg.join("\n") : (msg ?? "Erro inesperado.");
        throw new ErroApi(texto, resposta.status);
    }

    return dados as T;
}