    import { useEffect, useState } from "react";
    import "./Complejos.css";
    import { listarComplejos, registrarComplejo, modificarComplejo } from "../../services/api"; 
    import PageHeader from "../../components/ui/PageHeader";
    import DataTable from "../../components/ui/DataTable";
    import NuevoComplejoModal from "../../components/features/NuevoComplejoModal";
    import EditarComplejoModal from "../../components/features/EditarComplejoModal";
    import ConfirmDialog from "../../components/ui/ConfirmDialog"; // <-- NUEVO IMPORT
    import TableActions, { EditActionButton, DeleteActionButton } from "../../components/ui/TableActions";

    function PlusIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;
    }
    function ChevronDownIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
    }
    function SearchIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    }
    function MapPinIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></svg>;
    }

    function StatusBadge({ estado }) {
    const isActive = estado === "ACTIVO";
    return (
        <span className={`dash-complejos-status ${isActive ? "is-active" : "is-inactive"}`}>
        <span className="dash-complejos-status-dot" aria-hidden="true" />
        {isActive ? "Activo" : "Inactivo"}
        </span>
    );
    }

    export default function Complejos() {
    const [complejos, setComplejos] = useState([]);
    const [filtro, setFiltro] = useState("Todos");
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [intento, setIntento] = useState(0);
    
    // Estados de los modales
    const [mostrarModal, setMostrarModal] = useState(false);
    const [complejoEditando, setComplejoEditando] = useState(null);
    const [complejoAConfirmar, setComplejoAConfirmar] = useState(null);
    const [procesandoAccion, setProcesandoAccion] = useState(false);

    useEffect(() => {
        const controller = new AbortController();
        async function cargar() {
        setError("");
        try {
            const datos = await listarComplejos(controller.signal);
            if (!controller.signal.aborted) setComplejos(datos);
        } catch (err) {
            if (!controller.signal.aborted) setError(err.message);
        } finally {
            if (!controller.signal.aborted) setCargando(false);
        }
        }
        cargar();
        return () => controller.abort();
    }, [intento]);

    function reintentar() {
        setCargando(true);
        setError("");
        setIntento((actual) => actual + 1);
    }

    async function crearComplejo(datos) {
        const creado = await registrarComplejo(datos);
        setComplejos((actuales) => [...actuales, creado]);
        setFiltro("Todos");
        setBusqueda("");
    }

    const handleEditarComplejo = async (id, datos) => {
        const actualizado = await modificarComplejo(id, datos);
        setComplejos((prev) => prev.map((c) => (c.idComplejo === id ? actualizado : c)));
        setComplejoEditando(null); // Cerramos el modal
    };

    const handleToggleEstadoConfirm = async () => {
        if (!complejoAConfirmar) return;
        setProcesandoAccion(true);
        try {
        const nuevoEstado = complejoAConfirmar.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
        const actualizado = await modificarComplejo(complejoAConfirmar.idComplejo, { ...complejoAConfirmar, estado: nuevoEstado });
        setComplejos((prev) => prev.map((c) => (c.idComplejo === actualizado.idComplejo ? actualizado : c)));
        setComplejoAConfirmar(null);
        } catch (e) {
        alert(e.message);
        } finally {
        setProcesandoAccion(false);
        }
    };

    const visibles = complejos.filter((c) => {
        if (filtro === "Activos" && c.estado !== "ACTIVO") return false;
        if (filtro === "Inactivos" && c.estado !== "INACTIVO") return false;
        if (busqueda.trim()) {
        const q = busqueda.trim().toLowerCase();
        return c.nombre.toLowerCase().includes(q) || c.direccion.toLowerCase().includes(q);
        }
        return true;
    });

    const totalActivos = complejos.filter((c) => c.estado === "ACTIVO").length;
    const totalInactivos = complejos.length - totalActivos;

    const columns = [
        {
        key: "nombre",
        label: "COMPLEJO",
        width: "1.7fr",
        render: (item) => (
            <div className="dash-complejos-col-complejo">
            <span className="dash-complejos-avatar" aria-hidden="true">
                {item.nombre.charAt(0).toUpperCase()}
            </span>
            <div className="dash-complejos-info">
                <span className="dash-complejos-nombre">{item.nombre}</span>
                <span className="dash-complejos-sub">{item.telefono || "Sin teléfono registrado"}</span>
            </div>
            </div>
        ),
        },
        {
        key: "direccion",
        label: "DIRECCIÓN",
        width: "1.9fr",
        render: (item) => (
            <div className="dash-complejos-col-direccion">
            <span className="dash-complejos-pin" aria-hidden="true"><MapPinIcon /></span>
            <span className="dash-complejos-direccion">{item.direccion}</span>
            </div>
        ),
        },
        {
        key: "estado",
        label: "ESTADO",
        width: "0.9fr",
        render: (item) => <StatusBadge estado={item.estado} />,
        },
        {
        key: "admin",
        label: "ADMINISTRADORES",
        width: "1.1fr",
        render: () => <span className="dash-complejos-admin-nombre">No disponible</span>,
        },
        {
        key: "acciones",
        label: "ACCIONES",
        width: "1.3fr",
        align: "right",
        render: (item) => (
            <TableActions>
            {/* Abre el modal de edición pasando los datos del complejo */}
            <EditActionButton onClick={() => setComplejoEditando(item)} />
            
            {/* Abre el modal de confirmación pasando el complejo */}
            <DeleteActionButton 
                onClick={() => setComplejoAConfirmar(item)} 
                title={item.estado === "ACTIVO" ? "Desactivar" : "Activar"} 
                variant="neutral" 
            />
            </TableActions>
        ),
        },
    ];

    return (
        <>
        <section className="dash-complejos-header">
            <div className="dash-complejos-header-info">
            <PageHeader
                title="Gestión de complejos"
                description="Administra los complejos deportivos registrados, sedes, ubicaciones y administradores asignados en la plataforma."
            />
            </div>
            <button className="dash-complejos-new" type="button" onClick={() => setMostrarModal(true)}>
            <PlusIcon />
            <span>Nuevo complejo</span>
            </button>
        </section>

        <section className="dash-complejos-card" aria-busy={cargando}>
            <div className="dash-complejos-toolbar">
            <div className="dash-complejos-filters">
                <div className="dash-complejos-dropdown-wrap">
                <label htmlFor="estado-filter" className="dash-complejos-dropdown-label">ESTADO:</label>
                <div className="dash-complejos-select-wrap">
                    <select
                    id="estado-filter"
                    className="dash-complejos-dropdown"
                    disabled={cargando || Boolean(error)}
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    >
                    <option value="Todos">Todos</option>
                    <option value="Activos">Activos</option>
                    <option value="Inactivos">Inactivos</option>
                    </select>
                    <span className="dash-complejos-select-arrow" aria-hidden="true"><ChevronDownIcon /></span>
                </div>
                </div>

                <div className="dash-complejos-segmented" role="tablist">
                {[
                    { key: "Todos", count: complejos.length },
                    { key: "Activos", count: totalActivos },
                    { key: "Inactivos", count: totalInactivos },
                ].map(({ key, count }) => (
                    <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={filtro === key}
                    className={`dash-complejos-segment ${filtro === key ? "is-active" : ""}`}
                    disabled={cargando || Boolean(error)}
                    onClick={() => setFiltro(key)}
                    >
                    {key} ({cargando || error ? "—" : count})
                    </button>
                ))}
                </div>
            </div>

            <div className="dash-complejos-search">
                <span className="dash-complejos-search-icon" aria-hidden="true"><SearchIcon /></span>
                <input
                type="search"
                aria-label="Buscar complejos por nombre o dirección"
                disabled={cargando || Boolean(error)}
                placeholder="Buscar por nombre de complejo, dirección..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            </div>

            <DataTable
            columns={columns}
            data={visibles}
            loading={cargando}
            error={error}
            onRetry={reintentar}
            emptyMessage={
                complejos.length === 0
                ? "No hay complejos registrados."
                : "No se encontraron complejos con ese criterio."
            }
            />

            {!cargando && !error && (
            <div className="dash-complejos-paginator">
                <span className="dash-complejos-paginator-info" role="status">
                Mostrando {visibles.length} de {complejos.length} complejos en total
                </span>
            </div>
            )}
        </section>

        {/* MODAL DE CREAR */}
        {mostrarModal && (
            <NuevoComplejoModal
            onClose={() => setMostrarModal(false)}
            onSubmit={crearComplejo}
            />
        )}

        {/* MODAL DE EDITAR */}
        {complejoEditando && (
            <EditarComplejoModal
            complejo={complejoEditando}
            onClose={() => setComplejoEditando(null)}
            onSubmit={handleEditarComplejo}
            />
        )}

        {/* MODAL DE CONFIRMACIÓN (Activar/Desactivar) */}
        <ConfirmDialog
            isOpen={Boolean(complejoAConfirmar)}
            title={complejoAConfirmar?.estado === "ACTIVO" ? "Desactivar complejo" : "Activar complejo"}
            message={`¿Estás seguro de que deseas ${complejoAConfirmar?.estado === "ACTIVO" ? "desactivar" : "activar"} el complejo ${complejoAConfirmar?.nombre}?`}
            confirmText={complejoAConfirmar?.estado === "ACTIVO" ? "Sí, desactivar" : "Sí, activar"}
            onConfirm={handleToggleEstadoConfirm}
            onCancel={() => setComplejoAConfirmar(null)}
            busy={procesandoAccion}
            danger={complejoAConfirmar?.estado === "ACTIVO"}
        />
        </>
    );
    }