import { Transform } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class ItemReceitaDto {
    @IsInt()
    @Min(1)
    medicamentoId: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @Max(9999.99)
    dose: number;

    @IsInt()
    @Min(1)
    @Max(999)
    intervaloValor: number;

    @IsIn(['HORAS', 'DIAS', 'SEMANAS'])
    intervaloUnidade: 'HORAS' | 'DIAS' | 'SEMANAS';

    /** Obrigatória fora do uso contínuo; no uso contínuo é ignorada (vale o mapa do backend). */
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(365)
    duracaoDias?: number;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;
        const v = value.trim();
        return v === '' ? undefined : v;
    })
    condicaoUso?: string;

    /** Só para gotas e xarope: quantidade de frascos digitada pelo médico. */
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(999)
    quantidade?: number;
}