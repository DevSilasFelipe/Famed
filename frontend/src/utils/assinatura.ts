function pemParaDer(pem: string) {
    const base64 = pem
        .replace(/-----[^-]+-----/g, "") // remove as linhas BEGIN/END, seja qual for o rótulo
        .replace(/\s+/g, ""); // remove quebras de linha e espaços
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/** Assina o texto com a chave privada (PEM PKCS#8) e devolve a assinatura em base64. */
export async function assinarTexto(pem: string, texto: string): Promise<string> {
    if (!pem.includes("BEGIN PRIVATE KEY")) {
        throw new Error("O arquivo selecionado não é uma chave privada do Famed.");
    }

    let chave: CryptoKey;
    try {
        chave = await crypto.subtle.importKey(
            "pkcs8",
            pemParaDer(pem),
            { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
            false,
            ["sign"],
        );
    } catch {
        throw new Error("Não foi possível ler a chave. Use o arquivo .pem gerado no seu cadastro.");
    }

    const assinatura = await crypto.subtle.sign(
        "RSASSA-PKCS1-v1_5",
        chave,
        new TextEncoder().encode(texto),
    );
    return btoa(String.fromCharCode(...new Uint8Array(assinatura)));
}