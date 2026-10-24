import { useState } from "react";
import type { ChangeEvent } from "react";

export function useFormulario<T extends Record<string, string>>(inicial: T) {
    const [valores, setValores] = useState<T>(inicial);

    function atualizar(e:ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const {name, value} = e.target;
        setValores((anterior) => ({ ...anterior, [name]: value}));
    }

    function definir(campo: keyof T & string, valor: string) {
        setValores((anterior) => ({ ...anterior, [campo]: valor}));
    }

    return { valores, atualizar, definir }
}