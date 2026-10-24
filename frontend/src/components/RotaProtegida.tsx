import { Navigate, Outlet } from "react-router-dom";
import { perfilLogado } from "../auth/sessao";
import type { Perfil } from "../auth/sessao";

interface RotaProtegidaProps {
    perfil: Perfil;
}

export default function RotaProtegida({ perfil }: RotaProtegidaProps) {
    if (perfilLogado() !== perfil) {
    return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}