import { IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { SomenteDigitos } from '../../common/transforms/somente-digitos';
import { Transform } from 'class-transformer';

export class CriarPacientePorMedicoDto {
    @IsString()
    @IsNotEmpty()
    nome: string;

    @SomenteDigitos()
    @Matches(/^\d{11}$/, { message: 'CPF deve ter 11 digitos' })
    cpf: string;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataNascimento deve estar no formato AAAA-MM-DD' })
    @IsISO8601({ strict: true, strictSeparator: true }, { message: 'dataNascimento não é uma data válida' })
    dataNascimento: string;

    @IsOptional()
    @IsIn(['M', 'F'])
    sexo?: string;
}