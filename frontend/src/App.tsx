import { BrowserRouter, Routes, Route } from "react-router-dom";
import MedicoLayout from "./layouts/MedicoLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/medico" element={<MedicoLayout />}>
          <Route index element={<h1>Início do médico</h1>} />
          <Route path="pacientes" element={<h1>Meus Pacientes</h1>} />
          <Route path="receitas" element={<h1>Minhas Receitas</h1>} />
          <Route path="prescricao" element={<h1>Nova Prescrição</h1>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}