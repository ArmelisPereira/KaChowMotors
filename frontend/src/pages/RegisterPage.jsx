import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cliente",
  });

  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

const handleSubmit = async (e) => {
  e.preventDefault();
  setMensagem("");
  setErro("");

  try {
    const resposta = await register(form);
    console.log("Resposta do backend:", resposta);
    setMensagem("Utilizador registado com sucesso! ⚡");
  } catch (err) {
    console.error("Erro no registo front:", err);

    const msgBackend =
      err?.response?.data?.msg ||
      err?.response?.data?.error ||
      "Erro ao registar. Verifica os dados.";

    setErro(msgBackend);
  }
};


  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Criar conta</h2>
        <p className="auth-subtitle">
          Junta-te à equipa e começa a marcar serviços à velocidade do Rayo ⚡
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div>
            <label className="auth-label">Nome</label>
            <input
              className="auth-input"
              placeholder="Nome"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

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

          <div>
            <label className="auth-label">Tipo de utilizador</label>
            <select
              className="auth-select"
              defaultValue="cliente"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="cliente">Cliente</option>
              <option value="mecanico">Mecânico</option>
              <option value="admin_oficina">Admin Oficina</option>
            </select>
          </div>

          <button type="submit" className="auth-button">
            Registar
          </button>
        </form>

        {mensagem && (
          <p style={{ marginTop: "0.8rem", color: "#9bff8b", fontSize: "0.85rem" }}>
            {mensagem}
          </p>
        )}

        {erro && (
          <p style={{ marginTop: "0.8rem", color: "#ff8b8b", fontSize: "0.85rem" }}>
            {erro}
          </p>
        )}

        <div className="auth-footer">
          Já tens conta? <Link to="/login">Faz login aqui</Link>.
        </div>
      </div>
    </div>
  );
}
