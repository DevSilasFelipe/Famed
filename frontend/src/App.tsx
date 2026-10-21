import { BrowserRouter, Routes, Route } from "react-router-dom";
import MedicoLayout from "./layouts/MedicoLayout";
import Inicio from "./pages/medico/Inicio";
import Historico from "./pages/medico/Historico";
import Prescricao from "./pages/medico/Prescricao";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/medico" element={<MedicoLayout />}>
          <Route index element={<Inicio />} />
          <Route path="pacientes" element={<h1>Meus Pacientes</h1>} />
          <Route path="receitas" element={<Historico />} />
          <Route path="prescricao" element={<Prescricao />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}