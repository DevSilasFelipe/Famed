import { ValidatePromise } from 'class-validator';
import { ValueTransformer } from 'typeorm';

// converte coisas no objeto Date para texto, que é o que o ts espera na coluna de data.

export const colunaData: ValueTransformer = {
    to: (valor: unknown) => valor,
    from: (valor: Date | string | null) => {
        if (!(valor instanceof Date)) return valor;
        const ano = valor.getFullYear();
        const mes = String(valor.getMonth() + 1).padStart(2, '0');
        const dia = String(valor.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
    }
};

// converte o TINYINT do myslq pra um booleano de verdade (true ou false)

export const colunaBooleana: ValueTransformer = {
    to: (valor: unknown) => valor,
    from: (valor: number | boolean | null) =>
        valor === null ? null : Boolean(valor),
};