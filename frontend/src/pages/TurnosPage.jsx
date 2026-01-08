import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

export default function TurnosPage() {
  const navigate = useNavigate();
  const { user, loadingAuth } = useContext(AuthContext);

  const isAdmin = useMemo(() => user?.role === "admin_oficina", [user]);

  const [oficinas, setOficinas] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [turnos, setTurnos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    oficinaId: "",
    data: "",
    servicoId: "",
  });

  const [form, setForm] = useState({
    oficina: "",
    servico: "",
    data: "",
    horaInicio: "",
    horaFim: "",
    vagasTotal: 1,
  });

  const loadOficinas = async () => {
    const res = await api.get("/oficinas");
    setOficinas(res.data);
    return res.data;
  };

  const loadServicos = async (oficinaId) => {
    if (!oficinaId) {
      setServicos([]);
      return [];
    }
    const res = await api.get(`/servicos/oficina/${oficinaId}`);
    setServicos(res.data);
    return res.data;
  };

  const loadTurnos = async (oficinaId, data, servicoId) => {
    if (!oficinaId) {
      setTurnos([]);
      return;
    }

    const params = {};
    if (data) params.data = data;
    if (servicoId) params.servicoId = servicoId;

    const res = await api.get(`/turnos/oficina/${oficinaId}`, { params });
    setTurnos(res.data);
  };

  const init = async () => {
    try {
      setLoading(true);
      setError("");

      const ofs = await loadOficinas();
      const defaultOficina = user?.oficina || ofs?.[0]?._id || "";

      setFilters((p) => ({ ...p, oficinaId: defaultOficina }));
      setForm((p) => ({ ...p, oficina: defaultOficina }));

      const svs = await loadServicos(defaultOficina);
      const defaultServico = svs?.[0]?._id || "";

      setFilters((p) => ({ ...p, servicoId: "" }));
      setForm((p) => ({ ...p, servico: defaultServico }));

      await loadTurnos(defaultOficina, "", "");
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingAuth) init();
  }, [loadingAuth]);

  useEffect(() => {
    if (!filters.oficinaId) return;
    loadServicos(filters.oficinaId);
    loadTurnos(filters.oficinaId, filters.data, filters.servicoId);
  }, [filters.oficinaId, filters.data, filters.servicoId]);

  const onFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((p) => ({ ...p, [name]: value }));
    if (name === "oficinaId") {
      setFilters((p) => ({ ...p, servicoId: "" }));
    }
  };

  const onFormChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const createTurno = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.oficina || !form.data || !form.horaInicio || !form.horaFim || !form.vagasTotal) {
      setError("Campos obrigatórios em falta");
      return;
    }

    const vagasNum = Number(form.vagasTotal);
    if (Number.isNaN(vagasNum) || vagasNum < 1) {
      setError("vagasTotal inválido");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/turnos", {
        oficina: form.oficina,
        servico: form.servico || null,
        data: form.data,
        horaInicio: form.horaInicio,
        horaFim: form.horaFim,
        vagasTotal: vagasNum,
      });

      await loadTurnos(filters.oficinaId, filters.data, filters.servicoId);

      setForm((p) => ({
        ...p,
        data: "",
        horaInicio: "",
        horaFim: "",
        vagasTotal: 1,
      }));
    } catch (e2) {
      setError(e2?.response?.data?.msg || "Erro ao criar turno");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTurno = async (id) => {
    try {
      setError("");
      await api.delete(`/turnos/${id}`);
      await loadTurnos(filters.oficinaId, filters.data, filters.servicoId);
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao apagar turno");
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

  if (!isAdmin) {
    return (
      <div className="login-required">
        <p>Esta página é só para admins.</p>
      </div>
    );
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="turnos-page">
      <h2>Gestão de Turnos</h2>

      {error && <p className="error">{error}</p>}

      <div className="card">
        <h3>Filtrar turnos</h3>

        <div className="turnos-filtros">
          <label>
            Oficina
            <select name="oficinaId" value={filters.oficinaId} onChange={onFilterChange}>
              {oficinas.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Data
            <input name="data" value={filters.data} onChange={onFilterChange} placeholder="YYYY-MM-DD" />
          </label>

          <label>
            Serviço (opcional)
            <select name="servicoId" value={filters.servicoId} onChange={onFilterChange}>
              <option value="">Todos</option>
              {servicos.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Turnos existentes</h3>

        {turnos.length === 0 ? (
          <p>Sem turnos para os filtros atuais.</p>
        ) : (
          <ul className="turnos-list">
            {turnos.map((t) => (
              <li key={t._id} className="turno-card">
                <div>
                  <strong>{t.data}</strong> — {t.horaInicio} às {t.horaFim} • vagas: {t.vagasTotal}
                  {t.servico ? <span className="tag">Serviço definido</span> : <span className="tag">Serviço: qualquer</span>}
                </div>
                <button onClick={() => deleteTurno(t._id)}>Apagar</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Criar turno</h3>

        <form onSubmit={createTurno} className="turno-form">
          <label>
            Oficina
            <select name="oficina" value={form.oficina} onChange={onFormChange}>
              {oficinas.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Serviço (opcional)
            <select name="servico" value={form.servico} onChange={onFormChange}>
              <option value="">Qualquer</option>
              {servicos.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.nome}
                </option>
              ))}
            </select>
          </label>

          <label>
            Data
            <input name="data" value={form.data} onChange={onFormChange} placeholder="YYYY-MM-DD" />
          </label>

          <label>
            Hora início
            <input name="horaInicio" value={form.horaInicio} onChange={onFormChange} placeholder="HH:mm" />
          </label>

          <label>
            Hora fim
            <input name="horaFim" value={form.horaFim} onChange={onFormChange} placeholder="HH:mm" />
          </label>

          <label>
            Vagas
            <input name="vagasTotal" value={form.vagasTotal} onChange={onFormChange} placeholder="1" />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "A criar..." : "Criar turno"}
          </button>
        </form>
      </div>
    </div>
  );
}
