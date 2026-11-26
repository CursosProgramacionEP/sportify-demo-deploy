import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { listarMisComplejos, listarCanchas } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import MetricCards from "../../components/ui/MetricCards";

const CONFIG_COMPLEJO = [
  { id: "totalCanchas", label: "MIS CANCHAS", icon: "cancha", color: "#00d1ff" },
  { id: "canchasActivas", label: "CANCHAS ACTIVAS", icon: "pulse", color: "#79ff5b" },
  { id: "reservasHoy", label: "RESERVAS HOY", icon: "users", color: "#fbbf24" },
];

export default function DashboardComplejo() {
  const { usuario } = useOutletContext();
  const [metricas, setMetricas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function cargarDatos() {
      setCargando(true);
      setError("");
      try {
        const relaciones = await listarMisComplejos(controller.signal);
        if (relaciones.length === 0) {
          setError("No tienes un complejo asignado actualmente.");
          return;
        }
        
        const idComplejo = relaciones[0].idComplejo;
        const canchas = await listarCanchas(idComplejo, controller.signal);
        
        setMetricas({
          totalCanchas: canchas.length,
          canchasActivas: canchas.filter(c => c.estado === "ACTIVA").length,
          reservasHoy: 0, 
        });
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }
    cargarDatos();
    return () => controller.abort();
  }, [intento]);

  return (
    <div>
      <PageHeader
        title={`Bienvenido, ${usuario.nombres}`}
        description="Este es el panel de control de tu complejo deportivo."
        badge="ADMINISTRADOR DE COMPLEJO"
      />
      
      <MetricCards 
        config={CONFIG_COMPLEJO}
        data={metricas}
        loading={cargando}
        error={error}
        onRetry={() => setIntento(n => n + 1)} 
      />

      <section className="dash-admins-card" style={{ padding: "32px", marginTop: "24px" }}>
        <h3 style={{ color: "var(--color-text)", marginBottom: "16px" }}>Gestión de mi sede</h3>
        <p style={{ color: "var(--color-text-muted)", lineHeight: "1.6" }}>
          Usa el menú superior para ir a <strong>Mi Complejo</strong> y administrar tus canchas.
        </p>
      </section>
    </div>
  );
}