import { Transform } from 'class-transformer';

// Função feita pra não ter que digitar o @transforme inteiro toda vez.
export const SomenteDigitos = () =>
    Transform(({ value }) => {
        if (typeof value === 'string') {
           return value.replace(/\D/g, '');
        } else {
            return value;
        }
    });