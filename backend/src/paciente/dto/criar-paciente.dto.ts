import { IsEmail, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { SomenteDigitos } from '../../common/transforms/somente-digitos';
import { Transform } from 'class-transformer';

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
    @Matches(/^\d{11}$/, { message: 'CPF deve ter 11 dígitos' })
    cpf:string;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataNascimento deve estar no formato AAAA-MM-DD (com os hífens)' })
    @IsISO8601({ strict: true, strictSeparator: true }, { message: 'dataNascimento não é uma data válida' })
    dataNascimento: string;

    @IsOptional()
    @IsIn(['M', 'F'])
    sexo?: string;


}