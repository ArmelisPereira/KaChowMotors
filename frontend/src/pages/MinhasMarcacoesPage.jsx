import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function MinhasMarcacoesPage() {
  const navigate = useNavigate();
  const { user, loadingAuth } = useContext(AuthContext);

  const isCliente = useMemo(() => user?.role === "cliente", [user]);

  const [marcacoes, setMarcacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/marcacoes/me");
      setMarcacoes(res.data);
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao carregar marcações");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingAuth) {
      if (!user) return;
      load();
    }
  }, [loadingAuth, user]);

  const cancelar = async (id) => {
    try {
      setActionId(id);
      setError("");
      await api.patch(`/marcacoes/${id}/cancelar`);
      await load();
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao cancelar marcação");
    } finally {
      setActionId("");
    }
  };

  if (loadingAuth) return <p>A carregar sessão...</p>;

  if (!user) {
    return (
      <div className="minhas-marcacoes">
        <p>Tens de fazer login para ver as tuas marcações.</p>
        <button onClick={() => navigate("/login")}>Ir para Login</button>
      </div>
    );
  }

  if (!isCliente) {
    return (
      <div className="minhas-marcacoes">
        <p>Esta página é só para clientes.</p>
      </div>
    );
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="minhas-marcacoes">
      <h2>Minhas Marcações</h2>

      {error && <p className="error">{error}</p>}

      {marcacoes.length === 0 ? (
        <div>
          <p>Não tens marcações ainda.</p>
          <Link to="/oficinas">Ir para oficinas</Link>
        </div>
      ) : (
        <ul className="marcacoes-list">
          {marcacoes.map((m) => (
            <li key={m._id} className="marcacao-card">
              <p className="estado">Estado: {m.estado}</p>

              <p>
                <strong>Oficina:</strong> {m.oficina?.nome || "-"}{" "}
                {m.oficina?.localizacao ? `(${m.oficina.localizacao})` : ""}
              </p>

              <p>
                <strong>Serviço:</strong> {m.servico?.nome || "-"}{" "}
                {m.servico?.tipo ? `- ${m.servico.tipo}` : ""}{" "}
                {m.servico?.preco !== undefined ? `(${Number(m.servico.preco).toFixed(2)}€)` : ""}
              </p>

              <p>
                <strong>Veículo:</strong> {m.veiculo?.matricula || "-"}{" "}
                {m.veiculo?.marca ? `- ${m.veiculo.marca}` : ""}{" "}
                {m.veiculo?.modelo ? `${m.veiculo.modelo}` : ""}
              </p>

              <p>
                <strong>Data/Hora:</strong> {m.data} {m.hora}
              </p>

              {m.turno ? (
                <p>
                  <strong>Turno:</strong> {m.turno.data} {m.turno.horaInicio} - {m.turno.horaFim}
                </p>
              ) : null}

              <div className="acoes">
                {m.estado === "AGENDADA" ? (
                  <button
                    onClick={() => cancelar(m._id)}
                    disabled={actionId === m._id}
                  >
                    {actionId === m._id ? "A cancelar..." : "Cancelar"}
                  </button>
                ) : (
                  <span className="info">Não pode cancelar neste estado</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
