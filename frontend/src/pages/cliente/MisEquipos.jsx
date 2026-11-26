import { useEffect, useMemo, useState } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import {
    listarMisEquipos, listarJugadores, crearEquipo, editarEquipo,
    cambiarNivelEquipo, cambiarEstadoEquipo, transferirCapitan,
    agregarJugador, retirarJugador,
} from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import DataTable from "../../components/ui/DataTable";
import TableActions, { DeleteActionButton } from "../../components/ui/TableActions";
import CrearEquipoModal from "../../components/features/CrearEquipoModal";
import AgregarJugadorModal from "../../components/features/AgregarJugadorModal";
import "./MisEquipos.css";

const NIVEL_LABEL = {
    PRINCIPIANTE: "Principiante",
    INTERMEDIO: "Intermedio",
    AVANZADO: "Avanzado",
};

function PlusIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
}

function iniciales(nombre) {
    return nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}

function avatarTone(nombre) {
    const tones = ["cyan", "violet", "green", "amber"];
    const sum = nombre.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return tones[sum % tones.length];
}

export default function MisEquipos() {
    const { usuario } = useOutletContext();
    const [searchParams, setSearchParams] = useSearchParams();

    const [equipos, setEquipos] = useState([]);
    const [cargandoLista, setCargandoLista] = useState(true);
    const [errorLista, setErrorLista] = useState("");
    const [intentoLista, setIntentoLista] = useState(0);

    // Cargar lista de equipos
    useEffect(() => {
        const controller = new AbortController();
        listarMisEquipos(controller.signal)
            .then((datos) => { if (!controller.signal.aborted) { setEquipos(datos); setErrorLista(""); } })
            .catch((err) => { if (!controller.signal.aborted) setErrorLista(err.message); })
            .finally(() => { if (!controller.signal.aborted) setCargandoLista(false); });
        return () => controller.abort();
    }, [intentoLista]);

    const reintentarLista = () => {
        setCargandoLista(true);
        setErrorLista("");
        setIntentoLista((n) => n + 1);
    };

    // Selección de equipo por URL
    const idSeleccionado = searchParams.get("equipo");
    const idEquipo = idSeleccionado ? Number(idSeleccionado) : null;

    useEffect(() => {
        if (!idSeleccionado && equipos.length > 0) {
            setSearchParams({ equipo: String(equipos[0].idEquipo) }, { replace: true });
        }
    }, [equipos, idSeleccionado, setSearchParams]);

    const equipoSeleccionado = useMemo(
        () => equipos.find((e) => e.idEquipo === idEquipo) ?? null,
        [equipos, idEquipo]
    );

    const esCapitan = equipoSeleccionado?.idUsuarioResponsable === usuario.idUsuario;
    const equipoActivo = equipoSeleccionado?.estado === "ACTIVO";
    const puedeGestionar = esCapitan && equipoActivo;

    // Cargar plantel del equipo seleccionado
    const [plantel, setPlantel] = useState([]);
    const [cargandoPlantel, setCargandoPlantel] = useState(true);
    const [errorPlantel, setErrorPlantel] = useState("");
    const [intentoPlantel, setIntentoPlantel] = useState(0);

    useEffect(() => {
        if (!idEquipo) return;
        const controller = new AbortController();
        listarJugadores(idEquipo, controller.signal)
            .then((datos) => { if (!controller.signal.aborted) { setPlantel(datos); setErrorPlantel(""); } })
            .catch((err) => { if (!controller.signal.aborted) setErrorPlantel(err.message); })
            .finally(() => { if (!controller.signal.aborted) setCargandoPlantel(false); });
        return () => controller.abort();
    }, [idEquipo, intentoPlantel]);

    // Estados de modales y acciones
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [modalAgregar, setModalAgregar] = useState(false);
    const [jugadorAQuitar, setJugadorAQuitar] = useState(null);
    const [nivelPendiente, setNivelPendiente] = useState(null);
    const [estadoPendiente, setEstadoPendiente] = useState(null);
    const [capitanPendiente, setCapitanPendiente] = useState(null);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    // Handlers
    const handleCrear = async (payload) => {
        await crearEquipo(payload);
        setMensaje("Equipo creado correctamente.");
        setIntentoLista((n) => n + 1);
    };

    const handleEditar = async ({ nombre }) => {
        const actualizado = await editarEquipo(equipoSeleccionado.idEquipo, nombre);
        setEquipos((prev) => prev.map((e) => e.idEquipo === actualizado.idEquipo ? actualizado : e));
        setMensaje("Nombre actualizado.");
    };

    const handleCambiarNivel = async () => {
        if (!nivelPendiente) return;
        setProcesando(true);
        try {
            const actualizado = await cambiarNivelEquipo(equipoSeleccionado.idEquipo, nivelPendiente);
            setEquipos((prev) => prev.map((e) => e.idEquipo === actualizado.idEquipo ? actualizado : e));
            setNivelPendiente(null);
            setMensaje("Nivel actualizado.");
        } catch (err) {
            alert(err.message);
        } finally {
            setProcesando(false);
        }
    };

    const handleCambiarEstado = async () => {
        if (!estadoPendiente) return;
        setProcesando(true);
        try {
            const actualizado = await cambiarEstadoEquipo(equipoSeleccionado.idEquipo, estadoPendiente);
            setEquipos((prev) => prev.map((e) => e.idEquipo === actualizado.idEquipo ? actualizado : e));
            setEstadoPendiente(null);
            setMensaje(`Equipo ${estadoPendiente === "ACTIVO" ? "activado" : "desactivado"}.`);
        } catch (err) {
            alert(err.message);
        } finally {
            setProcesando(false);
        }
    };

    const handleTransferirCapitan = async () => {
        if (!capitanPendiente) return;
        setProcesando(true);
        try {
            const actualizado = await transferirCapitan(equipoSeleccionado.idEquipo, capitanPendiente.idUsuario);
            setEquipos((prev) => prev.map((e) => e.idEquipo === actualizado.idEquipo ? actualizado : e));
            setCapitanPendiente(null);
            setIntentoPlantel((n) => n + 1);
            setMensaje("Capitanía transferida.");
        } catch (err) {
            alert(err.message);
        } finally {
            setProcesando(false);
        }
    };

    const handleAgregarJugador = async (idUsuario) => {
        await agregarJugador(equipoSeleccionado.idEquipo, idUsuario);
        setIntentoPlantel((n) => n + 1);
        setMensaje("Jugador agregado.");
    };

    const handleRetirarJugador = async () => {
        if (!jugadorAQuitar) return;
        setProcesando(true);
        try {
            await retirarJugador(equipoSeleccionado.idEquipo, jugadorAQuitar.idUsuario);
            setPlantel((prev) => prev.filter((j) => j.idUsuario !== jugadorAQuitar.idUsuario));
            setJugadorAQuitar(null);
            setMensaje("Jugador retirado.");
        } catch (err) {
            alert(err.message);
        } finally {
            setProcesando(false);
        }
    };

    const seleccionarEquipo = (id) => {
        setSearchParams({ equipo: String(id) });
        setCargandoPlantel(true);
        setErrorPlantel("");
        setMensaje("");
    };

    // Columnas de la tabla de jugadores
    const columnasPlantel = [
        {
            key: "jugador",
            label: "JUGADOR",
            width: "1.5fr",
            render: (j) => (
                <div className="dash-admins-col-nombre">
                    <span className={`dash-admins-avatar is-${avatarTone(`${j.nombres} ${j.apellidos}`)}`} aria-hidden="true">
                        {iniciales(`${j.nombres} ${j.apellidos}`)}
                    </span>
                    <div className="dash-admins-info">
                        <span className="dash-admins-nombre">{j.nombres} {j.apellidos}</span>
                        <span className="dash-admins-texto" style={{ fontSize: "12px" }}>{j.correo}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "rol",
            label: "ROL",
            width: "0.7fr",
            render: (j) => (
                <span className={`usuarios-status ${j.rolEquipo === "CAPITAN" ? "is-active" : ""}`}>
                    {j.rolEquipo === "CAPITAN" ? "Capitán" : "Jugador"}
                </span>
            ),
        },
        ...(puedeGestionar ? [{
            key: "acciones",
            label: "ACCIONES",
            width: "0.6fr",
            align: "right",
            render: (j) => j.rolEquipo === "CAPITAN" ? null : (
                <TableActions>
                    <DeleteActionButton onClick={() => setJugadorAQuitar(j)} title="Retirar del equipo" />
                </TableActions>
            ),
        }] : []),
    ];

    if (errorLista) {
        return (
            <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: 16 }}>
                <StatusMessage message={errorLista} />
                <Button onClick={reintentarLista}>Reintentar</Button>
            </div>
        );
    }

    return (
        <>
            <section className="dash-complejos-header">
                <div className="dash-complejos-header-info">
                    <PageHeader title="Mis equipos" description="Gestiona tus equipos, plantel y jugadores." badge="CLIENTE" />
                </div>
                <button className="dash-complejos-new" type="button" onClick={() => setModalCrear(true)}>
                    <PlusIcon />
                    <span>Crear equipo</span>
                </button>
            </section>

            <StatusMessage message={mensaje} type="exito" />

            {cargandoLista ? (
                <section className="dash-admins-card" style={{ padding: 40, textAlign: "center", color: "var(--color-text-muted)" }}>
                    Cargando equipos...
                </section>
            ) : equipos.length === 0 ? (
                <section className="dash-admins-card" style={{ padding: 48, textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: 16 }}>
                        Aún no tienes equipos. Crea el primero para empezar a organizar tu plantel.
                    </p>
                    <Button onClick={() => setModalCrear(true)}>Crear mi primer equipo</Button>
                </section>
            ) : (
                <div className="mis-equipos-grid">
                    <aside className="dash-admins-card mis-equipos-sidebar" aria-label="Lista de equipos">
                        <div className="mis-equipos-sidebar-header">Tus equipos ({equipos.length})</div>
                        <ul className="mis-equipos-list">
                            {equipos.map((e) => {
                                const esMio = e.idUsuarioResponsable === usuario.idUsuario;
                                return (
                                    <li key={e.idEquipo}>
                                        <button
                                            type="button"
                                            className={`mis-equipos-item ${e.idEquipo === idEquipo ? "is-active" : ""}`}
                                            onClick={() => seleccionarEquipo(e.idEquipo)}
                                        >
                                            <span className={`dash-admins-avatar is-${avatarTone(e.nombre)}`} aria-hidden="true">
                                                {iniciales(e.nombre)}
                                            </span>
                                            <span className="mis-equipos-item-body">
                                                <span className="mis-equipos-item-name">{e.nombre}</span>
                                                <span className="mis-equipos-item-meta">
                                                    {esMio ? "Capitán" : "Jugador"} · {NIVEL_LABEL[e.nivel] ?? e.nivel}
                                                </span>
                                            </span>
                                            {e.estado === "INACTIVO" && (
                                                <span className="usuarios-status" style={{ fontSize: 10 }}>Inactivo</span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>

                    {equipoSeleccionado && (
                        <section className="dash-admins-card mis-equipos-main">
                            <header className="mis-equipos-main-header">
                                <div className="mis-equipos-title-area">
                                    <div className="mis-equipos-title-row">
                                        <h2 className="mis-equipos-title">{equipoSeleccionado.nombre}</h2>
                                        <span className={`usuarios-status ${equipoSeleccionado.estado === "ACTIVO" ? "is-active" : ""}`}>
                                            {equipoSeleccionado.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>
                                    <div className="mis-equipos-meta">
                                        <span className="mis-equipos-meta-item">
                                            <strong>Nivel:</strong> {NIVEL_LABEL[equipoSeleccionado.nivel] ?? equipoSeleccionado.nivel}
                                        </span>
                                        <span className="mis-equipos-meta-item">
                                            <strong>Plantel:</strong> {equipoSeleccionado.totalJugadores} jugadores
                                        </span>
                                        <span className="mis-equipos-meta-item">
                                            <strong>Creado:</strong> {new Date(equipoSeleccionado.fechaCreacion).toLocaleDateString("es-PE")}
                                        </span>
                                    </div>
                                </div>
                            </header>

                                                        {esCapitan && (
                                <div className="mis-equipos-toolbar">
                                    <div className="mis-equipos-toolbar-group">
                                        <button className="dash-complejos-new btn-dark" type="button" onClick={() => setModalEditar(true)}>
                                            Editar nombre
                                        </button>
                                        <button 
                                            className="dash-complejos-new btn-dark" 
                                            type="button" 
                                            onClick={() => setEstadoPendiente(equipoSeleccionado.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO")}
                                            disabled={procesando}
                                        >
                                            {equipoSeleccionado.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                                        </button>
                                        <button 
                                            className="dash-complejos-new btn-dark" 
                                            type="button" 
                                            onClick={() => setCapitanPendiente({})}
                                            disabled={!equipoActivo || plantel.length < 2}
                                            title={plantel.length < 2 ? "Necesitas al menos un jugador más" : ""}
                                        >
                                            Transferir capitanía
                                        </button>
                                    </div>
                                    
                                    <div className="mis-equipos-toolbar-group">
                                        <div className="dash-complejos-select-wrap">
                                            <select
                                                className="dash-complejos-dropdown"
                                                value={equipoSeleccionado.nivel}
                                                onChange={(e) => setNivelPendiente(e.target.value)}
                                                disabled={!equipoActivo || procesando}
                                            >
                                                {Object.entries(NIVEL_LABEL).map(([k, v]) => (
                                                    <option key={k} value={k}>{v}</option>
                                                ))}
                                            </select>
                                            <span className="dash-complejos-select-arrow" aria-hidden="true">
                                                <svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mis-equipos-plantel-header">
                                <h3>Plantilla de Jugadores</h3>
                                {puedeGestionar && plantel.length < 20 && (
                                    <button className="dash-complejos-new" type="button" onClick={() => setModalAgregar(true)}>
                                        <PlusIcon />
                                        <span>Agregar jugador</span>
                                    </button>
                                )}
                            </div>

                            {errorPlantel ? (
                                <div style={{ padding: 20 }}>
                                    <StatusMessage message={errorPlantel} />
                                    <div style={{ marginTop: 12 }}>
                                        <Button onClick={() => { setCargandoPlantel(true); setErrorPlantel(""); setIntentoPlantel((n) => n + 1); }}>
                                            Reintentar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <DataTable columns={columnasPlantel} data={plantel} loading={cargandoPlantel} emptyMessage="Este equipo aún no tiene jugadores." />
                            )}
                        </section>
                    )}
                </div>
            )}

            {modalCrear && <CrearEquipoModal onClose={() => setModalCrear(false)} onSubmit={handleCrear} />}
            {modalEditar && equipoSeleccionado && (
                <CrearEquipoModal equipo={equipoSeleccionado} onClose={() => setModalEditar(false)} onSubmit={handleEditar} />
            )}
            {modalAgregar && <AgregarJugadorModal onClose={() => setModalAgregar(false)} onSubmit={handleAgregarJugador} />}

            <ConfirmDialog
                isOpen={Boolean(jugadorAQuitar)}
                title="Retirar jugador"
                message={`¿Retirar a ${jugadorAQuitar?.nombres} ${jugadorAQuitar?.apellidos} del equipo?`}
                confirmText="Sí, retirar"
                onConfirm={handleRetirarJugador}
                onCancel={() => setJugadorAQuitar(null)}
                busy={procesando}
                danger
            />
            <ConfirmDialog
                isOpen={Boolean(nivelPendiente)}
                title="Cambiar nivel"
                message={`¿Cambiar el nivel del equipo a "${NIVEL_LABEL[nivelPendiente] ?? nivelPendiente}"?`}
                confirmText="Sí, cambiar"
                onConfirm={handleCambiarNivel}
                onCancel={() => setNivelPendiente(null)}
                busy={procesando}
                danger={false}
            />
            <ConfirmDialog
                isOpen={Boolean(estadoPendiente)}
                title={estadoPendiente === "ACTIVO" ? "Activar equipo" : "Desactivar equipo"}
                message={`¿${estadoPendiente === "ACTIVO" ? "Activar" : "Desactivar"} el equipo "${equipoSeleccionado?.nombre}"?`}
                confirmText={estadoPendiente === "ACTIVO" ? "Sí, activar" : "Sí, desactivar"}
                onConfirm={handleCambiarEstado}
                onCancel={() => setEstadoPendiente(null)}
                busy={procesando}
                danger={estadoPendiente === "INACTIVO"}
            />

            {capitanPendiente && equipoSeleccionado && (
                <div className="mis-equipos-capitan-overlay" role="dialog" aria-modal="true">
                    <div className="mis-equipos-capitan-dialog">
                        <h3>Transferir capitanía</h3>
                        <p className="mis-equipos-capitan-desc">Elige al jugador que será el nuevo capitán.</p>
                        <ul className="mis-equipos-capitan-list">
                            {plantel.filter((j) => j.idUsuario !== equipoSeleccionado.idUsuarioResponsable).map((j) => (
                                <li key={j.idUsuario}>
                                    <button type="button" className="mis-equipos-capitan-option" onClick={() => setCapitanPendiente(j)}>
                                        {j.nombres} {j.apellidos}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className="sportify-dialog-actions">
                            <Button variant="secondary" onClick={() => setCapitanPendiente(null)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={Boolean(capitanPendiente?.idUsuario)}
                title="Confirmar transferencia"
                message={`¿Transferir la capitanía a ${capitanPendiente?.nombres} ${capitanPendiente?.apellidos}? Perderás los permisos de gestión.`}
                confirmText="Sí, transferir"
                onConfirm={handleTransferirCapitan}
                onCancel={() => setCapitanPendiente(null)}
                busy={procesando}
                danger
            />
        </>
    );
}