import { IsEmail, IsString, Matches, MinLength, IsNotEmpty, MaxLength } from 'class-validator';
import { SomenteDigitos  } from '../../common/transforms/somente-digitos';
import { Transform } from 'class-transformer';

export class CriarFarmaciaDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    senha: string;

    @SomenteDigitos()
    @Matches(/^\d{14}$/, { message: 'CNPJ deve ter 14 digitos!' })
    cnpj: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    endereco: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    nome: string;
}