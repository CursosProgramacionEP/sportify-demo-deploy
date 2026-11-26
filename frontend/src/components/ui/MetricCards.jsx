import StatusMessage from "./StatusMessage";
import Button from "./Button";

function MetricIcon({ name, color }) {
  const paths = {
    building: (<><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M16 9h3a2 2 0 0 1 2 2v10" /><path d="M2 21h20" /><path d="M8 7h2M8 11h2M8 15h2" /></>),
    pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
    shield: (<><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>),
    users: (<><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" /><path d="M16 3.5a3 3 0 0 1 0 5.8" /><path d="M21 21v-2a5 5 0 0 0-3-4.5" /></>),
    cancha: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></>,
  };

  return (
    <span className="dash-metric-icon" aria-hidden="true" style={{ color, backgroundColor: `${color}1a` }}>
      <svg viewBox="0 0 24 24">{paths[name]}</svg>
    </span>
  );
}

/**
 * Componente genérico para mostrar las tarjetas de métricas.
 * @param {Array} config Arreglo con id, label, icon, color.
 * @param {Object} data Objeto con los valores reales (ej. { complejos: 12 }).
 */
export default function MetricCards({ config = [], data = {}, loading = false, error = "", onRetry }) {
  if (error) {
    return (
      <section className="dash-metrics">
        <div className="dash-metrics-grid" style={{ gridTemplateColumns: "1fr" }}>
          <article className="dash-metric-card">
            <StatusMessage message={error} />
            <div style={{ marginTop: 12 }}><Button onClick={onRetry}>Reintentar</Button></div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="dash-metrics" aria-label="Métricas del dashboard">
      <div className="dash-metrics-grid">
        {config.map((m) => (
          <article key={m.id} className="dash-metric-card">
            <div className="dash-metric-card-top">
              <div className="dash-metric-card-info">
                <span className="dash-metric-label">{m.label}</span>
                <div className="dash-metric-value-row">
                  <span className="dash-metric-value">{loading ? "—" : (data?.[m.id] ?? 0)}</span>
                </div>
              </div>
              <MetricIcon name={m.icon} color={m.color} />
            </div>
            <div className="dash-metric-card-bottom dash-metric-card-bottom-divider" />
            <span className="dash-metric-glow" aria-hidden="true" style={{ backgroundColor: `${m.color}15` }} />
          </article>
        ))}
      </div>
    </section>
  );
}