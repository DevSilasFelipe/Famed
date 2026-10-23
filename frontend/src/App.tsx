import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import RotaProtegida from "./components/RotaProtegida";
import type { NavbarProps } from "./components/Navbar";
import Login from "./pages/Login";
import Inicio from "./pages/medico/Inicio";
import Historico from "./pages/medico/Historico";
import Prescricao from "./pages/medico/Prescricao";
import CadastrarPaciente from "./pages/medico/CadastrarPaciente";
import MinhasReceitas from "./pages/paciente/MinhasReceitas";
import BuscarReceita from "./pages/farmacia/BuscarReceita";
import Cadastro from "./pages/Cadastro";
import Home from "./pages/Home";

const menuMedico: NavbarProps = {
  links: [
    { to: "/medico", texto: "Home" },
    { to: "/medico/pacientes", texto: "Meus Pacientes" },
    { to: "/medico/receitas", texto: "Minhas Receitas" },
  ],
  acao: { to: "/medico/prescricao", texto: "CRIAR" },
};

const menuPaciente: NavbarProps = {
  links: [
    { to: "/paciente/farmacias", texto: "Farmácias Perto" },
    { to: "/paciente", texto: "Minhas Receitas" },
  ],
};

const menuFarmacia: NavbarProps = {
  links: [
    { to: "/farmacia", texto: "Buscar Receita" },
    { to: "/farmacia/dispensadas", texto: "Receitas Dispensadas" },
  ],
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        
        <Route element={<RotaProtegida perfil="medico" />}>
          <Route path="/medico" element={<Layout {...menuMedico} />}>
            <Route index element={<Inicio />} />
            <Route path="pacientes" element={<CadastrarPaciente />} />
            <Route path="receitas" element={<Historico />} />
            <Route path="prescricao" element={<Prescricao />} />
          </Route>
        </Route>

        <Route element={<RotaProtegida perfil="paciente" />}>
          <Route path="/paciente" element={<Layout {...menuPaciente} />}>
            <Route index element={<MinhasReceitas />} />
            <Route path="farmacias" element={<h1>Farmácias Perto</h1>} />
          </Route>
        </Route>

        <Route element={<RotaProtegida perfil="farmacia" />}>
          <Route path="/farmacia" element={<Layout {...menuFarmacia} />}>
            <Route index element={<BuscarReceita />} />
            <Route path="dispensadas" element={<h1>Receitas Dispensadas</h1>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}