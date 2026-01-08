import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getTurnosByOficina } from "../api/turnos";
import { getMyVeiculos } from "../api/veiculos";
import { criarMarcacao } from "../api/marcacoes";
import api from "../api/api";

export default function MarcarServicoPage() {
  const { oficinaId, servicoId } = useParams();
  const navigate = useNavigate();
  const { user, loadingAuth } = useContext(AuthContext);

  const isCliente = useMemo(() => user?.role === "cliente", [user]);

  const [servico, setServico] = useState(null);
  const [turnos, setTurnos] = useState([]);
  const [veiculos, setVeiculos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    veiculo: "",
    turno: "",
    data: "",
    hora: ""
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [servRes, turnosRes, veicRes] = await Promise.all([
        api.get(`/servicos/${servicoId}`),
        getTurnosByOficina(oficinaId, { servicoId }),
        getMyVeiculos()
      ]);

      setServico(servRes.data);
      setTurnos(turnosRes.data);
      setVeiculos(veicRes.data);

      const firstTurno = turnosRes.data?.[0];
      setForm((p) => ({
        ...p,
        veiculo: veicRes.data?.[0]?._id || "",
        turno: firstTurno?._id || "",
        data: firstTurno?.data || "",
        hora: firstTurno?.horaInicio || ""
      }));
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao carregar dados para marcação");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingAuth) load();
  }, [loadingAuth, oficinaId, servicoId]);

  const selectedTurno = useMemo(
    () => turnos.find((t) => t._id === form.turno),
    [turnos, form.turno]
  );

  useEffect(() => {
    if (selectedTurno) {
      setForm((p) => ({
        ...p,
        data: selectedTurno.data,
        hora: selectedTurno.horaInicio
      }));
    }
  }, [form.turno]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isCliente) {
      setError("Só clientes podem criar marcações.");
      return;
    }

    if (!form.veiculo || !form.turno || !form.data || !form.hora) {
      setError("Seleciona veículo, turno e hora.");
      return;
    }

    try {
      setSubmitting(true);

      await criarMarcacao({
        veiculo: form.veiculo,
        servico: servicoId,
        turno: form.turno,
        data: form.data,
        hora: form.hora
      });

      navigate("/minhas-marcacoes");
    } catch (e2) {
      setError(e2?.response?.data?.msg || "Erro ao criar marcação");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAuth) return <p style={{ padding: 16 }}>A carregar sessão...</p>;

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <p>Tens de fazer login para marcar um serviço.</p>
        <button onClick={() => navigate("/login")}>Ir para Login</button>
      </div>
    );
  }

  if (!isCliente) {
    return (
      <div style={{ padding: 16 }}>
        <p>Esta página é só para clientes.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Marcar Serviço</h2>

      {error ? (
        <div style={{ background: "#ffe5e5", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {loading ? <p>A carregar...</p> : null}

      {!loading && servico ? (
        <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <h3 style={{ margin: 0 }}>{servico.nome}</h3>
          <p style={{ margin: "6px 0", opacity: 0.85 }}>{servico.tipo}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", opacity: 0.85 }}>
            <span>{Number(servico.preco).toFixed(2)}€</span>
            <span>{servico.duracaoMin} min</span>
          </div>
          {servico.descricaoPublica ? <p style={{ marginTop: 10 }}>{servico.descricaoPublica}</p> : null}
        </div>
      ) : null}

      {!loading && veiculos.length === 0 ? (
        <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
          <p>Não tens veículos registados. Cria um veículo antes de marcar.</p>
          <button onClick={() => navigate("/meus-veiculos")}>Ir para Veículos</button>
        </div>
      ) : null}

      {!loading && veiculos.length > 0 ? (
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
          <label>
            Veículo
            <select name="veiculo" value={form.veiculo} onChange={onChange} style={{ width: "100%", marginTop: 6 }}>
              {veiculos.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.matricula} — {v.marca} {v.modelo}
                </option>
              ))}
            </select>
          </label>

          <label>
            Turno
            <select name="turno" value={form.turno} onChange={onChange} style={{ width: "100%", marginTop: 6 }}>
              {turnos.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.data} — {t.horaInicio} às {t.horaFim} (vagas: {t.vagasTotal})
                </option>
              ))}
            </select>
          </label>

          <label>
            Hora (dentro do turno)
            <input
              name="hora"
              value={form.hora}
              onChange={onChange}
              placeholder="HH:mm"
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "A marcar..." : "Confirmar Marcação"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
