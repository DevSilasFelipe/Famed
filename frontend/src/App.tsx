import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/medico" element={<Navbar />} />
      </Routes>
    </BrowserRouter>
  );
}