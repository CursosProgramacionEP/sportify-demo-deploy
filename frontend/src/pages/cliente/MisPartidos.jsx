import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom"; // <-- 1. Importar
import { listarMisEquipos, listarPartidos, registrarPartido } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusMessage from "../../components/ui/StatusMessage";
import RegistrarPartidoModal from "../../components/features/RegistrarPartidoModal";
import "./MisPartidos.css";

const RESULTADO_LABEL = {
    VICTORIA: "Victoria",
    EMPATE: "Empate",
    DERROTA: "Derrota",
};

function PlusIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}

function formatoFecha(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

export default function MisPartidos() {
    const { usuario } = useOutletContext(); // <-- 2. Extraer el usuario
    const [equipos, setEquipos] = useState([]);
    const [idEquipoSeleccionado, setIdEquipoSeleccionado] = useState("");
    
    const [partidos, setPartidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [modalAbierto, setModalAbierto] = useState(false);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        listarMisEquipos(controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) {
                    setEquipos(data);
                    if (data.length > 0) {
                        setIdEquipoSeleccionado(data[0].idEquipo);
                    } else {
                        setCargando(false);
                    }
                }
            })
            .catch((err) => {
                if (!controller.signal.aborted) {
                    setError(err.message);
                    setCargando(false);
                }
            });
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (!idEquipoSeleccionado) return;
        const controller = new AbortController();
        
        listarPartidos(idEquipoSeleccionado, controller.signal)
            .then((data) => {
                if (!controller.signal.aborted) setPartidos(data);
            })
            .catch((err) => {
                if (!controller.signal.aborted) setError(err.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargando(false);
            });
        return () => controller.abort();
    }, [idEquipoSeleccionado, intento]);

    const handleEquipoChange = (e) => {
        setCargando(true);
        setError("");
        setIdEquipoSeleccionado(Number(e.target.value));
    };

    const handleRegistrar = async (datos) => {
        await registrarPartido(idEquipoSeleccionado, datos);
        setIntento((n) => n + 1);
    };

    const equipoActual = equipos.find(e => e.idEquipo === idEquipoSeleccionado);
    
    // 3. Ahora `usuario` ya existe y no dará error
    const puedeRegistrar = equipoActual?.idUsuarioResponsable === usuario?.idUsuario && equipoActual?.estado === "ACTIVO";

    const columnas = [
        {
            key: "fecha",
            label: "FECHA",
            width: "0.9fr",
            render: (p) => <span className="dash-admins-texto">{formatoFecha(p.fecha)}</span>,
        },
        {
            key: "rival",
            label: "RIVAL",
            width: "1.5fr",
            render: (p) => (
                <div className="dash-admins-info">
                    <span className="dash-admins-nombre">{p.rival}</span>
                    {p.observaciones && (
                        <span className="dash-admins-texto" style={{ fontSize: "12px" }}>{p.observaciones}</span>
                    )}
                </div>
            ),
        },
        {
            key: "resultado",
            label: "RESULTADO",
            width: "0.9fr",
            render: (p) => (
                <span className={`partidos-resultado is-${p.resultado.toLowerCase()}`}>
                    {RESULTADO_LABEL[p.resultado] ?? p.resultado}
                </span>
            ),
        },
        {
            key: "marcador",
            label: "MARCADOR",
            width: "0.7fr",
            render: (p) => (
                <span className="dash-admins-nombre" style={{ fontSize: 16 }}>
                    {p.golesFavor} - {p.golesContra}
                </span>
            ),
        },
    ];

    return (
        <>
            <section className="dash-complejos-header">
                <div className="dash-complejos-header-info">
                    <PageHeader
                        title="Historial de Partidos"
                        description="Consulta los resultados de todos tus equipos en un solo lugar."
                        badge="CLIENTE"
                    />
                </div>
                {equipos.length > 0 && (
                    <button 
                        className="dash-complejos-new" 
                        type="button" 
                        onClick={() => setModalAbierto(true)}
                        disabled={!puedeRegistrar}
                        title={!puedeRegistrar ? "Solo el capitán de un equipo activo puede registrar partidos" : ""}
                    >
                        <PlusIcon />
                        <span>Añadir registro</span>
                    </button>
                )}
            </section>

            {equipos.length === 0 && !cargando && !error ? (
                <section className="dash-admins-card" style={{ padding: 40, textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-muted)" }}>
                        Aún no perteneces a ningún equipo, por lo que no hay partidos para mostrar.
                    </p>
                </section>
            ) : (
                <>
                    <div className="dash-admins-toolbar" style={{ borderRadius: "12px", border: "1px solid var(--color-border-soft)", backgroundColor: "var(--color-surface-deep)", marginBottom: "24px" }}>
                        <div className="dash-admins-filters">
                            <div className="dash-complejos-dropdown-wrap">
                                <label htmlFor="equipo-filter" className="dash-complejos-dropdown-label">EQUIPO:</label>
                                <div className="dash-complejos-select-wrap">
                                    <select
                                        id="equipo-filter"
                                        className="dash-complejos-dropdown"
                                        value={idEquipoSeleccionado}
                                        onChange={handleEquipoChange}
                                    >
                                        {equipos.map((e) => (
                                            <option key={e.idEquipo} value={e.idEquipo}>{e.nombre}</option>
                                        ))}
                                    </select>
                                    <span className="dash-complejos-select-arrow" aria-hidden="true">
                                        <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="dash-admins-card" style={{ padding: 0 }}>
                        {error ? (
                            <div style={{ padding: 40 }}>
                                <StatusMessage message={error} />
                            </div>
                        ) : (
                            <DataTable
                                columns={columnas}
                                data={partidos}
                                loading={cargando}
                                emptyMessage="Este equipo aún no tiene partidos registrados."
                            />
                        )}
                    </section>
                </>
            )}

            {modalAbierto && (
                <RegistrarPartidoModal 
                    onClose={() => setModalAbierto(false)} 
                    onSubmit={handleRegistrar} 
                />
            )}
        </>
    );
}