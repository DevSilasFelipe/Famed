export interface ParDeChaves {
    publica: string;
    privada: string;
}

function paraPem(buffer: ArrayBuffer, rotulo: string): string {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const linhas = base64.match(/.{1,64}/g)?.join("\n") ?? base64;
    return `-----BEGIN ${rotulo}-----\n${linhas}\n-----END ${rotulo}-----\n`;
}

/** Gera um par RSA de 2048 bits no navegador; a chave privada nunca sai daqui. */
export async function gerarParDeChaves(): Promise<ParDeChaves> {
    const par = await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"],
    );
    const publica = await crypto.subtle.exportKey("spki", par.publicKey);
    const privada = await crypto.subtle.exportKey("pkcs8", par.privateKey);
    return {
        publica: paraPem(publica, "PUBLIC KEY"),
        privada: paraPem(privada, "PRIVATE KEY"),
    };
}

export function baixarArquivo(nome: string, conteudo: string) : void {
    const url = URL.createObjectURL(new Blob([conteudo], { type: "application/x-pem-file" }));
    const a   = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
}