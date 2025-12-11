import { useEffect, useState } from "react";
import api from "../api/api";

export default function OficinasPage() {
  const [oficinas, setOficinas] = useState([]);

  useEffect(() => {
    const fetchOficinas = async () => {
      try {
        const res = await api.get("/oficinas");
        setOficinas(res.data);
      } catch (error) {
        console.error("Erro ao carregar oficinas:", error);
      }
    };

    fetchOficinas();
  }, []);

  return (
    <section style={{ marginTop: "2rem" }}>
      <h2 className="home-title">
        <span className="red">Oficinas</span> <span className="yellow">Disponíveis</span>
      </h2>

      <div style={{ marginTop: "1.5rem", display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {oficinas.map((oficina) => (
          <div key={oficina._id} className="home-card">
            <h3>{oficina.nome}</h3>
            <p style={{ marginTop: "0.4rem" }}>{oficina.descricao}</p>
            <p style={{ marginTop: "0.4rem", fontSize: "0.9rem", opacity: 0.9 }}>
              📍 {oficina.localizacao}
            </p>
            <p style={{ fontSize: "0.9rem" }}>📞 {oficina.contacto}</p>
          </div>
        ))}

        {oficinas.length === 0 && (
          <p style={{ marginTop: "1rem" }}>Ainda não há oficinas registadas.</p>
        )}
      </div>
    </section>
  );
}
