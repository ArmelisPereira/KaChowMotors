export default function HomePage() {
  return (
    <section className="home-hero">
      <div>
        <h1 className="home-title">
          <span className="red">Rayo</span> <span className="yellow">Garage</span>
        </h1>
        <p className="home-subtitle">
          Marcações de oficina à velocidade de um relâmpago. Agenda serviços, gere veículos
          e acompanha tudo numa plataforma feita para amantes de carros.
        </p>

        <div className="home-badges">
          <span className="badge">Velocidade</span>
          <span className="badge">Organização</span>
          <span className="badge">Pit Stop Digital</span>
        </div>
      </div>

      <div className="home-card">
        <h3>Pronto para arrancar?</h3>
        <p style={{ marginTop: "0.5rem", maxWidth: "260px" }}>
          Cria a tua conta, adiciona os teus veículos e começa a marcar serviços como se
          estivesses na linha de partida da Piston Cup.
        </p>
      </div>
    </section>
  );
}
