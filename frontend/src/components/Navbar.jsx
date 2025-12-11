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
            <Link to="/oficinas" className="navbar-link">
              Oficinas
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
