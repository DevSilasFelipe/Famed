import { IsIn, IsNotEmpty, IsOptional, isString, IsString, Matches } from 'class-validator';
import { SomenteDigitos } from '../../common/transforms/somente-digitos';

export class CriarPacientePorMedicoDto {
    @IsString()
    @IsNotEmpty()
    nome: string;

    @SomenteDigitos()
    @Matches(/^\d{11}$/, { message: 'CPF deve ter 11 digitos' })
    cpf: string;

    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'dataNascimento deve estar no formato AAAA-MM-DD' })
    dataNascimento: string;

    @IsOptional()
    @IsIn(['M', 'F'])
    sexo?: string;
}