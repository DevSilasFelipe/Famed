import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CriarListaControleDto {
    @IsString({ message: 'O código deve ser um texto.' })
    @IsNotEmpty( { message: 'O código é obrigatório.' })
    @MaxLength(20, { message: 'O código deve ter no máximo 20 caracteres.' })
    codigo: string;

    @IsString({ message: 'A descrição deve ser um texto.' })
    @IsNotEmpty({ message: 'A descrição é obrigatória' })
    @MaxLength(100, { message: 'A descrição deve ter no máximo 100 caracteres.' })
    descricao: string;

    @IsOptional()
    @IsInt({ message: 'validadeDias deve ser um número inteiro.' })
    @Min(1, { message: 'validadeDias deve ser maior que zero' })
    validadeDias?: number;

    @IsOptional()
    @IsInt({ message: 'usoContinuoMaxDias deve ser um número inteiro.' })
    @Min(1, { message: 'usoContinuoMaxDias deve ser maior que zero' })
    usoContinuoMaxDias?: number;
    
}