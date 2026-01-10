import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <span className="lightning">⚡</span>
          <span>RayoGarage</span>
        </div>

        <Link to="/" className="navbar-link">
          Home
        </Link>

        <Link to="/oficinas" className="navbar-link">
          Oficinas
        </Link>

        {user?.role === "cliente" && (
          <>
            <Link to="/minhas-marcacoes" className="navbar-link">
              Minhas Marcações
            </Link>
            <Link to="/meus-veiculos" className="navbar-link">
              Meus Veículos
            </Link>
          </>
        )}

        {user?.role === "admin_oficina" && (
          <Link to="/turnos" className="navbar-link">
            Turnos
          </Link>
        )}

        {user?.role === "admin_oficina" || user?.role === "mecanico" ? (
          <Link to="/turnos" className="navbar-link">
            Gerir Marcações
          </Link>
        ) : null}
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <span className="navbar-link">Olá, {user.name}</span>
            <button className="navbar-button" onClick={logout}>
              Sair
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Login
            </Link>
            <Link to="/register" className="navbar-link">
              Registo
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
