import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getServicosByOficina, createServico } from "../api/servicos";

export default function OficinaServicosPage() {
  const { oficinaId } = useParams();
  const { user } = useContext(AuthContext);

  const isAdmin = useMemo(() => user?.role === "admin_oficina", [user]);
  const isCliente = useMemo(() => user?.role === "cliente", [user]);

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

      if (
        !payload.nome ||
        !payload.tipo ||
        Number.isNaN(payload.preco) ||
        Number.isNaN(payload.duracaoMin)
      ) {
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

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="oficina-servicos">
      <h2>Serviços da Oficina</h2>

      {error && <p className="error">{error}</p>}

      {servicos.length === 0 && <p>Sem serviços ainda.</p>}

      <ul className="servicos-list">
        {servicos.map((s) => (
          <li key={s._id} className="servico-card">
            <h3>{s.nome}</h3>
            <p>{s.tipo}</p>
            <p>{Number(s.preco).toFixed(2)} €</p>
            <p>{s.duracaoMin} min</p>

            {s.descricaoPublica && <p>{s.descricaoPublica}</p>}

            <p>
              Vagas/turno: {s.vagasPorTurno} | Antecedência:{" "}
              {s.antecedenciaMinHoras}h
            </p>

            {isCliente && (
              <Link to={`/oficinas/${oficinaId}/servicos/${s._id}/marcar`}>
                Marcar
              </Link>
            )}

            {isAdmin && s.descricaoPrivada && (
              <div className="nota-admin">
                <strong>Nota interna:</strong>
                <p>{s.descricaoPrivada}</p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {isAdmin && (
        <section className="criar-servico">
          <h3>Criar novo serviço</h3>

          <form onSubmit={onSubmit}>
            <input
              name="nome"
              value={form.nome}
              onChange={onChange}
              placeholder="Nome"
            />
            <input
              name="tipo"
              value={form.tipo}
              onChange={onChange}
              placeholder="Tipo"
            />
            <input
              name="preco"
              value={form.preco}
              onChange={onChange}
              placeholder="Preço"
            />
            <input
              name="duracaoMin"
              value={form.duracaoMin}
              onChange={onChange}
              placeholder="Duração (min)"
            />

            <textarea
              name="descricaoPublica"
              value={form.descricaoPublica}
              onChange={onChange}
              placeholder="Descrição pública"
            />
            <textarea
              name="descricaoPrivada"
              value={form.descricaoPrivada}
              onChange={onChange}
              placeholder="Descrição privada"
            />

            <input
              name="vagasPorTurno"
              value={form.vagasPorTurno}
              onChange={onChange}
              placeholder="Vagas por turno"
            />
            <input
              name="antecedenciaMinHoras"
              value={form.antecedenciaMinHoras}
              onChange={onChange}
              placeholder="Antecedência mínima (h)"
            />

            <button type="submit">Criar serviço</button>
          </form>
        </section>
      )}
    </div>
  );
}
