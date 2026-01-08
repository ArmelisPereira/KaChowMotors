import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function MeusVeiculosPage() {
  const { user, loadingAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const isCliente = useMemo(() => user?.role === "cliente", [user]);

  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    matricula: "",
    ano: "",
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/veiculos/me");
      setVeiculos(res.data);
    } catch (e) {
      setError(e?.response?.data?.msg || e?.response?.data?.error || "Erro ao carregar veículos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingAuth && user) load();
  }, [loadingAuth, user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.marca || !form.modelo || !form.matricula || !form.ano) {
      setError("Preenche todos os campos.");
      return;
    }

    const anoNum = Number(form.ano);
    const maxAno = new Date().getFullYear() + 1;

    if (Number.isNaN(anoNum) || anoNum < 1900 || anoNum > maxAno) {
      setError("Ano inválido.");
      return;
    }

    try {
      await api.post("/veiculos", {
        marca: form.marca.trim(),
        modelo: form.modelo.trim(),
        matricula: form.matricula.trim(),
        ano: anoNum,
      });

      setForm({ marca: "", modelo: "", matricula: "", ano: "" });
      await load();
    } catch (e) {
      console.error("ERRO CRIAR VEICULO:", e?.response?.status, e?.response?.data || e);
      setError(
        e?.response?.data?.msg ||
          e?.response?.data?.error ||
          e?.message ||
          "Erro ao criar veículo"
      );
    }
  };

  const apagar = async (id) => {
    try {
      await api.delete(`/veiculos/${id}`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.msg || e?.response?.data?.error || "Erro ao apagar veículo");
    }
  };

  if (loadingAuth) return <p>A carregar sessão...</p>;

  if (!user) {
    return (
  <div className="login-required">
  <p>Tens de fazer login.</p>
  <button onClick={() => navigate("/login")}>Login</button>
</div>

    );
  }

  if (!isCliente) {
    return <p>Esta página é só para clientes.</p>;
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="meus-veiculos">
      <h2>Meus Veículos</h2>

      {error && <p className="error">{error}</p>}

      {veiculos.length === 0 && <p>Não tens veículos registados.</p>}

      <ul className="veiculos-list">
        {veiculos.map((v) => (
          <li key={v._id} className="veiculo-card">
            <p>
              <strong>{v.matricula}</strong> — {v.marca} {v.modelo} ({v.ano})
            </p>
            <button onClick={() => apagar(v._id)}>Apagar</button>
          </li>
        ))}
      </ul>

      <h3>Adicionar veículo</h3>

      <form onSubmit={onSubmit} className="veiculo-form">
        <input name="marca" value={form.marca} onChange={onChange} placeholder="Marca" />
        <input name="modelo" value={form.modelo} onChange={onChange} placeholder="Modelo" />
        <input name="matricula" value={form.matricula} onChange={onChange} placeholder="Matrícula (ex: AB-12-CD)" />
        <input name="ano" value={form.ano} onChange={onChange} placeholder="Ano (ex: 2018)" />
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}
