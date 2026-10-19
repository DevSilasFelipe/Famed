import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { SomenteDigitos  } from '../../common/transforms/somente-digitos';

export class CriarFarmaciaDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    senha: string;

    @SomenteDigitos()
    @Matches(/^\d{14}$/, { message: 'CNPJ deve ter 14 digitos!' })
    cnpj: string;
}