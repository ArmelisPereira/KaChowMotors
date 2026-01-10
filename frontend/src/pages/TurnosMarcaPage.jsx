import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";

export default function TurnosMarcaPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { marcacaoId } = useParams(); // Pega o ID da marcação da URL

  const [marcacao, setMarcacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMarcacao = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/marcacoes/${marcacaoId}`);
      setMarcacao(res.data); // Preenche o estado com os dados da marcação
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao carregar marcação");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (marcacaoId) {
      loadMarcacao();
    }
  }, [marcacaoId]);

  const changeStatus = async (status) => {
    try {
      await api.patch(`/marcacoes/${marcacaoId}/estado`, { estado: status });
      setMarcacao((prev) => ({ ...prev, estado: status })); // Atualiza o estado da marcação na UI
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao alterar estado da marcação");
    }
  };

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="turnos-marca-page">
      <h2>Gerir Marcação</h2>

      {error && <p className="error">{error}</p>}

      {marcacao ? (
        <div className="card">
          <h3>Detalhes da Marcação</h3>
          <p><strong>Cliente:</strong> {marcacao.cliente.name}</p>
          <p><strong>Serviço:</strong> {marcacao.servico.nome}</p>
          <p><strong>Estado:</strong> {marcacao.estado}</p>
          <p><strong>Veículo:</strong> {marcacao.veiculo.matricula} ({marcacao.veiculo.marca} {marcacao.veiculo.modelo})</p>

          <button onClick={() => changeStatus("EM_CURSO")}>Marcar como Em Curso</button>
          <button onClick={() => changeStatus("CONCLUÍDA")}>Marcar como Concluída</button>
        </div>
      ) : (
        <p>Marcações não encontradas.</p>
      )}
    </div>
  );
}
