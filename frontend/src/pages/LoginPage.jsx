import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password);
      alert("Login efetuado com sucesso! ⚡");
    } catch (err) {
      alert("Erro no login. Verifica os dados.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Entrar</h2>
        <p className="auth-subtitle">
          Bem-vindo de volta piloto! Prepara-te para arrancar 🏁
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="auth-label">Email</label>
            <input
              className="auth-input"
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button type="submit" className="auth-button">
            Entrar
          </button>
        </form>

        <div className="auth-footer">
          Não tens conta?{" "}
          <Link to="/register">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
