import { IsEmail, IsNotEmpty, IsString, MaxLength} from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Informe um email válido.' })
    @MaxLength(150, { message: 'O campo deve ter no máximo 150 caracteres.' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MaxLength(255, { message: 'A senha deve ter no máximo 255 caracteres.' })
    senha: string;
}