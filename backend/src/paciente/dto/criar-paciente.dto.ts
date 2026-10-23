import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, matches, Matches, MinLength } from 'class-validator';
import { SomenteDigitos } from '../../common/transforms/somente-digitos';

export class CriarPacienteDto {
    @IsString()
    @IsNotEmpty()
    nome: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    senha: string;

    @SomenteDigitos()
    @Matches(/^\d{11}$/m, { message: 'CPF deve ter 11 dígitos' })
    cpf:string;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataNascimento deve estar no formato AAAA-MM-DD (com os hífens)' })
    dataNascimento: string;

    @IsOptional()
    @IsIn(['M', 'F'])
    sexo?: string;


}