import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, Matches, ValidateNested } from "class-validator"
import { SomenteDigitos } from "../../common/transforms/somente-digitos"
import { Type } from "class-transformer";
import { ItemReceitaDto } from "./item-receita.dto";

export class PrepararReceitaDto {
    @SomenteDigitos()
    @Matches(/^\d{11}$/, { message: 'CPF do paciente deve ter 11 digitos' })
    pacienteCpf: string;

    @IsBoolean()
    usoContinuo: boolean;

    @IsArray()
    @ArrayMinSize(1, { message: 'Informe ao menos um medicamento.' })
    @ArrayMaxSize(20, { message: 'A receita pode ter no máximo 20 medicamentos.' })
    @ValidateNested({ each: true })
    @Type(() => ItemReceitaDto)
    itens: ItemReceitaDto[];
}