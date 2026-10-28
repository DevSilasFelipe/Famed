import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";
import { PrepararReceitaDto } from "./preparar-receita.dto";

export class EmitirReceitaDto extends PrepararReceitaDto {
    /** Selo devolvido pelo /receitas/preparar. */
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    selo: string;

    /** Assinatura RSASSA-PKCS1-v1_5/SHA-256 do texto canônico, em base64. */
    @IsString()
    @Matches(/^[A-Za-z0-9+/]+={0,2}$/, { message: 'assinatura deve estar em base64' })
    @MaxLength(1000)
    assinatura: string;
}