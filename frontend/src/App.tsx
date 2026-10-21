import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import type { NavbarProps } from "./components/Navbar";
import Inicio from "./pages/medico/Inicio";
import Historico from "./pages/medico/Historico";
import Prescricao from "./pages/medico/Prescricao";
import CadastrarPaciente from "./pages/medico/CadastrarPaciente";
import MinhasReceitas from "./pages/paciente/MinhasReceitas";

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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/medico" element={<Layout {...menuMedico} />}>
          <Route index element={<Inicio />} />
          <Route path="pacientes" element={<CadastrarPaciente />} />
          <Route path="receitas" element={<Historico />} />
          <Route path="prescricao" element={<Prescricao />} />
        </Route>

        <Route path="/paciente" element={<Layout {...menuPaciente} />}>
          <Route index element={<MinhasReceitas />} />
          <Route path="farmacias" element={<h1>Farmácias Perto</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}