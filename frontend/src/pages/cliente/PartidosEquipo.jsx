import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
    obtenerEquipo, listarPartidos, registrarPartido,
    editarPartido, eliminarPartido,
} from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/ui/DataTable";
import TableActions, { EditActionButton, DeleteActionButton } from "../../components/ui/TableActions";
import RegistrarPartidoModal from "../../components/features/RegistrarPartidoModal";
import "./PartidosEquipo.css";

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

export default function PartidosEquipo() {
    const { idEquipo } = useParams();
    const id = Number(idEquipo);
    const { usuario } = useOutletContext();
    const navigate = useNavigate();

    const [equipo, setEquipo] = useState(null);
    const [partidos, setPartidos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [intento, setIntento] = useState(0);

    const [modalCrear, setModalCrear] = useState(false);
    const [partidoEditar, setPartidoEditar] = useState(null);
    const [partidoAEliminar, setPartidoAEliminar] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        Promise.all([
            obtenerEquipo(id, controller.signal),
            listarPartidos(id, controller.signal),
        ])
            .then(([eq, ps]) => {
                if (controller.signal.aborted) return;
                setEquipo(eq);
                setPartidos(ps);
                setError("");
            })
            .catch((err) => {
                if (!controller.signal.aborted) setError(err.message);
            })
            .finally(() => {
                if (!controller.signal.aborted) setCargando(false);
            });
        return () => controller.abort();
    }, [id, intento]);

    const esCapitan = equipo?.idUsuarioResponsable === usuario.idUsuario;
    const equipoActivo = equipo?.estado === "ACTIVO";
    const puedeModificar = esCapitan && equipoActivo;

    const handleRegistrar = async (datos) => {
        const nuevo = await registrarPartido(id, datos);
        setPartidos((prev) => [nuevo, ...prev].sort((a, b) => b.fecha.localeCompare(a.fecha)));
        setMensaje("Partido registrado.");
    };

    const handleEditar = async (datos) => {
        const actualizado = await editarPartido(id, partidoEditar.idPartido, datos);
        setPartidos((prev) => prev.map((p) => p.idPartido === actualizado.idPartido ? actualizado : p));
        setMensaje("Partido actualizado.");
    };

    const handleEliminar = async () => {
        if (!partidoAEliminar) return;
        setProcesando(true);
        try {
            await eliminarPartido(id, partidoAEliminar.idPartido);
            setPartidos((prev) => prev.filter((p) => p.idPartido !== partidoAEliminar.idPartido));
            setPartidoAEliminar(null);
            setMensaje("Partido eliminado.");
        } catch (err) {
            alert(err.message);
        } finally {
            setProcesando(false);
        }
    };

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
        ...(puedeModificar ? [{
            key: "acciones",
            label: "ACCIONES",
            width: "0.8fr",
            align: "right",
            render: (p) => (
                <TableActions>
                    <EditActionButton onClick={() => setPartidoEditar(p)} />
                    <DeleteActionButton onClick={() => setPartidoAEliminar(p)} title="Eliminar" />
                </TableActions>
            ),
        }] : []),
    ];

    if (error) {
        return (
            <div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 16 }}>
                <StatusMessage message={error} />
                <div style={{ display: "flex", gap: 12 }}>
                    <Button onClick={() => { setCargando(true); setError(""); setIntento((n) => n + 1); }}>
                        Reintentar
                    </Button>
                    <Button variant="secondary" onClick={() => navigate("/dashboard/mis-equipos")}>
                        Volver a mis equipos
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="dash-complejos-header">
                <div className="dash-complejos-header-info">
                    <Link to="/dashboard/mis-equipos" className="partidos-breadcrumb">
                        ← Volver a mis equipos
                    </Link>
                    <PageHeader
                        title={equipo ? `Partidos — ${equipo.nombre}` : "Partidos"}
                        description="Historial de partidos jugados por el equipo."
                        badge="CLIENTE"
                    />
                </div>
                {puedeModificar && (
                    <button className="dash-complejos-new" type="button" onClick={() => setModalCrear(true)}>
                        <PlusIcon />
                        <span>Registrar partido</span>
                    </button>
                )}
            </section>

            {!equipoActivo && equipo && (
                <StatusMessage
                    message="El equipo está inactivo. Puedes consultar los partidos pero no modificarlos."
                    type="error"
                />
            )}

            <StatusMessage message={mensaje} type="exito" />

            <section className="dash-admins-card" style={{ padding: 0 }}>
                <DataTable
                    columns={columnas}
                    data={partidos}
                    loading={cargando}
                    emptyMessage="Este equipo aún no tiene partidos registrados."
                />
            </section>

            {modalCrear && (
                <RegistrarPartidoModal
                    onClose={() => setModalCrear(false)}
                    onSubmit={handleRegistrar}
                />
            )}
            {partidoEditar && (
                <RegistrarPartidoModal
                    partido={partidoEditar}
                    onClose={() => setPartidoEditar(null)}
                    onSubmit={handleEditar}
                />
            )}

            <ConfirmDialog
                isOpen={Boolean(partidoAEliminar)}
                title="Eliminar partido"
                message={`¿Eliminar el partido contra ${partidoAEliminar?.rival} (${formatoFecha(partidoAEliminar?.fecha)})?`}
                confirmText="Sí, eliminar"
                onConfirm={handleEliminar}
                onCancel={() => setPartidoAEliminar(null)}
                busy={procesando}
                danger
            />
        </>
    );
}