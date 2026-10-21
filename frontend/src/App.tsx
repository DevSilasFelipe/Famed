import { BrowserRouter, Routes, Route } from "react-router-dom";
import MedicoLayout from "./layouts/MedicoLayout";
import Inicio from "./pages/medico/Inicio";
import Historico from "./pages/medico/Historico";
import Prescricao from "./pages/medico/Prescricao";
import CadastrarPaciente from "./pages/medico/CadastrarPaciente";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/medico" element={<MedicoLayout />}>
          <Route index element={<Inicio />} />
          <Route path="pacientes" element={<CadastrarPaciente/>} />
          <Route path="receitas" element={<Historico />} />
          <Route path="prescricao" element={<Prescricao />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}