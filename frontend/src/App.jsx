import { Routes, Route } from "react-router-dom";
import OficinaServicosPage from "./pages/OficinaServicosPage";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OficinasPage from "./pages/OficinasPage.jsx";
import MarcarServicoPage from "./pages/MarcarServicoPage";
import MinhasMarcacoesPage from "./pages/MinhasMarcacoesPage.jsx";
import MeusVeiculosPage from "./pages/MeusVeiculosPage.jsx";
import TurnosPage from "./pages/TurnosPage.jsx"; // Página de administração de turnos
import TurnosMarcaPage from "./pages/TurnosMarcaPage.jsx"; // Gerenciar marcações do turno

import "./index.css";

function App() {
  return (
    <div className="app-background">
      <Navbar />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oficinas" element={<OficinasPage />} />
          <Route path="/oficinas/:oficinaId/servicos" element={<OficinaServicosPage />} />
          <Route path="/oficinas/:oficinaId/servicos/:servicoId/marcar" element={<MarcarServicoPage />} />
          <Route path="/minhas-marcacoes" element={<MinhasMarcacoesPage />} />
          <Route path="/meus-veiculos" element={<MeusVeiculosPage />} />

          {/* Página de Turnos */}
          <Route path="/turnos" element={<TurnosPage />} />

          {/* Página de Gerir Marcações */}
          <Route path="/turnos/marcacao/:marcacaoId" element={<TurnosMarcaPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
