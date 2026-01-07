import { useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getServicosByOficina, createServico } from "../api/servicos";

export default function OficinaServicosPage() {
  const { oficinaId } = useParams();
  const { user } = useContext(AuthContext);

  const isAdmin = useMemo(() => user?.role === "admin_oficina", [user]);

  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nome: "",
    tipo: "",
    preco: "",
    duracaoMin: "",
    descricaoPublica: "",
    descricaoPrivada: "",
    vagasPorTurno: 1,
    antecedenciaMinHoras: 0,
  });

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getServicosByOficina(oficinaId);
      setServicos(res.data);
    } catch (e) {
      setError(e?.response?.data?.msg || "Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [oficinaId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        oficina: oficinaId,
        nome: form.nome.trim(),
        tipo: form.tipo.trim(),
        preco: Number(form.preco),
        duracaoMin: Number(form.duracaoMin),
        descricaoPublica: form.descricaoPublica,
        descricaoPrivada: form.descricaoPrivada,
        vagasPorTurno: Number(form.vagasPorTurno),
        antecedenciaMinHoras: Number(form.antecedenciaMinHoras),
        mecanicosAutorizados: [],
      };

      if (!payload.nome || !payload.tipo || Number.isNaN(payload.preco) || Number.isNaN(payload.duracaoMin)) {
        setError("Preenche nome, tipo, preço e duração.");
        return;
      }

      await createServico(payload);

      setForm({
        nome: "",
        tipo: "",
        preco: "",
        duracaoMin: "",
        descricaoPublica: "",
        descricaoPrivada: "",
        vagasPorTurno: 1,
        antecedenciaMinHoras: 0,
      });

      await load();
    } catch (e2) {
      setError(e2?.response?.data?.msg || "Erro ao criar serviço");
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Serviços da Oficina</h2>

      {error ? (
        <div style={{ background: "#ffe5e5", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          {error}
        </div>
      ) : null}

      {loading ? <p>A carregar...</p> : null}

      {!loading && servicos.length === 0 ? <p>Sem serviços ainda.</p> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {servicos.map((s) => (
          <div key={s._id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <h3 style={{ margin: 0 }}>{s.nome}</h3>
                <p style={{ margin: "6px 0", opacity: 0.8 }}>{s.tipo}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div><strong>{Number(s.preco).toFixed(2)}€</strong></div>
                <div style={{ opacity: 0.8 }}>{s.duracaoMin} min</div>
              </div>
            </div>

            {s.descricaoPublica ? <p style={{ marginTop: 10 }}>{s.descricaoPublica}</p> : null}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8, opacity: 0.85 }}>
              <span>Vagas/turno: {s.vagasPorTurno}</span>
              <span>Antecedência: {s.antecedenciaMinHoras}h</span>
            </div>

            {isAdmin && s.descricaoPrivada ? (
              <div style={{ marginTop: 10, padding: 10, background: "#f6f6f6", borderRadius: 8 }}>
                <strong>Nota interna:</strong>
                <div>{s.descricaoPrivada}</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {isAdmin ? (
        <div style={{ marginTop: 28 }}>
          <h3>Criar novo serviço</h3>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
            <input name="nome" value={form.nome} onChange={onChange} placeholder="Nome" />
            <input name="tipo" value={form.tipo} onChange={onChange} placeholder="Tipo (ex: Manutenção)" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input name="preco" value={form.preco} onChange={onChange} placeholder="Preço (€)" />
              <input name="duracaoMin" value={form.duracaoMin} onChange={onChange} placeholder="Duração (min)" />
            </div>

            <textarea name="descricaoPublica" value={form.descricaoPublica} onChange={onChange} placeholder="Descrição pública" rows={3} />
            <textarea name="descricaoPrivada" value={form.descricaoPrivada} onChange={onChange} placeholder="Descrição privada (admin)" rows={2} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <input name="vagasPorTurno" value={form.vagasPorTurno} onChange={onChange} placeholder="Vagas por turno" />
              <input name="antecedenciaMinHoras" value={form.antecedenciaMinHoras} onChange={onChange} placeholder="Antecedência mínima (horas)" />
            </div>

            <button type="submit">Criar serviço</button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
