import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OficinasPage from "./pages/OficinasPage.jsx";
import "./index.css"

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
        </Routes>
      </main>
    </div>
  );
}

export default App;
