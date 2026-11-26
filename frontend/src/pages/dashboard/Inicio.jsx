    import { useEffect, useState } from "react";
    import { listarMetricas, listarActividad } from "../../services/api";
    import StatusMessage from "../../components/ui/StatusMessage";
    import Button from "../../components/ui/Button";
    import PageHeader from "../../components/ui/PageHeader";
    
    
    const FORM_METRICS = [
    { id: "complejos", label: "COMPLEJOS REGISTRADOS", icon: "building" },
    { id: "activos",   label: "COMPLEJOS ACTIVOS",     icon: "pulse" },
    { id: "admins",    label: "ADMINISTRADORES",       icon: "shield" },
    { id: "usuarios",  label: "USUARIOS REGISTRADOS",  icon: "users" },
    ];

    function tiempoRelativo(fechaStr) {
    if (!fechaStr) return "Hace un momento";
    const fecha = new Date(fechaStr);
    const ahora = new Date();
    const diffMin = Math.floor((ahora - fecha) / 60000);
    
    if (diffMin < 1) return "Hace un momento";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHoras = Math.floor(diffMin / 60);
    if (diffHoras < 24) return `Hace ${diffHoras} horas`;
    return `Hace ${Math.floor(diffHoras / 24)} días`;
    }

    function MetricIcon({ name }) {
    const paths = {
        building: (<><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M16 9h3a2 2 0 0 1 2 2v10" /><path d="M2 21h20" /><path d="M8 7h2M8 11h2M8 15h2" /></>),
        pulse: <path d="M3 12h4l2-6 4 12 2-6h6" />,
        shield: (<><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>),
        users: (<><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v2" /><path d="M16 3.5a3 3 0 0 1 0 5.8" /><path d="M21 21v-2a5 5 0 0 0-3-4.5" /></>),
    };
    return (
        <span className="dash-metric-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">{paths[name]}</svg>
        </span>
    );
    }

    function ActivityIcon({ type }) {
    const paths = {
        created: <path d="M12 5v14M5 12h14" />,
        disabled: (<><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>),
        admin: (<><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 16 0v1" /></>),
    };
    return (
        <span className={`dash-activity-icon dash-activity-icon-${type}`} aria-hidden="true">
        <svg viewBox="0 0 24 24">{paths[type] ?? paths.created}</svg>
        </span>
    );
    }

    function Metrics({ metricas, cargando, error, onRetry }) {
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
            {FORM_METRICS.map((m) => (
            <article key={m.id} className="dash-metric-card">
                <div className="dash-metric-card-top">
                <div className="dash-metric-card-info">
                    <span className="dash-metric-label">{m.label}</span>
                    <div className="dash-metric-value-row">
                    <span className="dash-metric-value">{cargando ? "—" : (metricas?.[m.id] ?? 0)}</span>
                    </div>
                </div>
                <MetricIcon name={m.icon} />
                </div>
                <div className="dash-metric-card-bottom dash-metric-card-bottom-divider" />
            </article>
            ))}
        </div>
        </section>
    );
    }

    function Activity({ actividades, cargando, error, onRetry }) {
    // Función para el icono
    const getTipo = (accion) => {
        if (accion.includes("CREAR") || accion.includes("ASIGNAR")) return "created";
        if (accion.includes("DESACTIVAR") || accion.includes("QUITAR")) return "disabled";
        return "admin";
    };

    // Función para el título amigable
    const getTituloBonito = (accion) => {
        const titulos = {
        CREAR_COMPLEJO: "Nuevo complejo registrado",
        EDITAR_COMPLEJO: "Complejo actualizado",
        ACTIVAR_COMPLEJO: "Complejo activado",
        DESACTIVAR_COMPLEJO: "Complejo desactivado",
        ASIGNAR_ADMIN: "Administrador asignado",
        QUITAR_ADMIN: "Administrador removido",
        };
        return titulos[accion] || accion.replace(/_/g, " ");
    };

    return (
        <section className="dash-activity" aria-label="Actividad reciente">
        <div className="dash-activity-inner">
            {/* ENCABEZADO DE ACTIVIDAD */}
            <header className="dash-activity-header">
            <div className="dash-activity-header-left">
                <span className="dash-activity-header-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>
                </span>
                <h2 className="dash-activity-title">Actividad reciente</h2>
            </div>
            </header>

            {/* LISTA DE ACTIVIDADES */}
            <div className="dash-activity-list">
            {cargando ? (
                <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: "20px" }}>
                Cargando actividad...
                </p>
            ) : error ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                <p style={{ color: "var(--color-danger-text)", marginBottom: "12px" }}>Error: {error}</p>
                <Button onClick={onRetry}>Reintentar</Button>
                </div>
            ) : actividades.length === 0 ? (
                <div className="dash-activity-empty">
                <p>No hay actividad reciente en la plataforma.</p>
                </div>
            ) : (
                actividades.map((item) => (
                <article key={item.id} className="dash-activity-item">
                    <ActivityIcon type={getTipo(item.accion)} />
                    <div className="dash-activity-body">
                    <div className="dash-activity-row">
                        <span className="dash-activity-item-title">
                        {getTituloBonito(item.accion)}
                        </span>
                        <span className="dash-activity-time">{tiempoRelativo(item.fecha)}</span>
                    </div>
                    <p className="dash-activity-description">{item.detalle}</p>
                    </div>
                </article>
                ))
            )}
            </div>
        </div>

        {/* PIE DE PÁGINA DE ACTIVIDAD */}
        <footer className="dash-activity-footer">
            <div className="dash-activity-footer-left">
            <span className="dash-activity-footer-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
                <path d="m9 12 2 2 4-4" />
                </svg>
            </span>
            <span>Registro inmutable de eventos</span>
            </div>
            <span>Última actualización: En tiempo real</span>
        </footer>
        </section>
    );
    }

    export default function Inicio() {
    const [metricas, setMetricas] = useState(null);
    const [cargandoM, setCargandoM] = useState(true);
    const [errorM, setErrorM] = useState("");
    const [intentoM, setIntentoM] = useState(0);

    const [actividades, setActividades] = useState([]);
    const [cargandoA, setCargandoA] = useState(true);
    const [errorA, setErrorA] = useState("");
    const [intentoA, setIntentoA] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        async function cargarMetricas() {
        setErrorM("");
        try {
            const datos = await listarMetricas(controller.signal);
            if (!controller.signal.aborted) setMetricas(datos);
        } catch (err) {
            if (!controller.signal.aborted) setErrorM(err.message);
        } finally {
            if (!controller.signal.aborted) setCargandoM(false);
        }
        }
        cargarMetricas();
        return () => controller.abort();
    }, [intentoM]);

    useEffect(() => {
        const controller = new AbortController();
        async function cargarActividad() {
        setErrorA("");
        try {
            const datos = await listarActividad(controller.signal);
            if (!controller.signal.aborted) setActividades(datos);
        } catch (err) {
            if (!controller.signal.aborted) setErrorA(err.message);
        } finally {
            if (!controller.signal.aborted) setCargandoA(false);
        }
        }
        cargarActividad();
        return () => controller.abort();
    }, [intentoA]);

    return (
        <>
        <PageHeader
            title="Resumen general"
            description="Consulta el estado de los complejos, administradores y actividad de la plataforma."
        />
        <Metrics 
            metricas={metricas} 
            cargando={cargandoM} 
            error={errorM} 
            onRetry={() => { setCargandoM(true); setErrorM(""); setIntentoM(n => n + 1); }} 
        />
        <Activity 
            actividades={actividades} 
            cargando={cargandoA} 
            error={errorA} 
            onRetry={() => { setCargandoA(true); setErrorA(""); setIntentoA(n => n + 1); }} 
        />
        </>
    );
    }