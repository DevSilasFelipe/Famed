import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { SomenteDigitos } from '../../common/transforms/somente-digitos';

export class CriarMedicoDto {
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
    cpf: string;

    @SomenteDigitos()
    @Matches(/^\d{1,10}$/, { message: 'CRM deve ter apenas números (até 10 dígitos)' })
    crm: string;

    @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
    @Matches(/^[A-Z]{2}$/, { message: 'UF deve ter 2 letras' })
    uf: string;

    @IsString()
    @IsNotEmpty()
    chavePublica: string;
}