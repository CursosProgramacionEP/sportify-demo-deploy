import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarMisComplejos, listarCanchas, registrarCancha, modificarCancha, cambiarEstadoCancha } from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusMessage from "../../components/ui/StatusMessage";
import Button from "../../components/ui/Button";
import TableActions, { ViewActionButton, EditActionButton, DeleteActionButton } from "../../components/ui/TableActions";
import { FormCanchaModal, DetalleCanchaModal } from "../../components/features/CanchaModals";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

function PlusIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>; }
function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>; }

export default function MiComplejo() {
    const [idComplejo, setIdComplejo] = useState(null);
    const [canchas, setCanchas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [intento, setIntento] = useState(0); 
    const [modalFormAbierto, setModalFormAbierto] = useState(false);
    const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
    const [canchaAEliminar, setCanchaAEliminar] = useState(null); 
    const [form, setForm] = useState({ nombre: "", precioHora: "", capacidad: "", estado: "ACTIVA" });
    const [enviando, setEnviando] = useState(false);
    const [errorForm, setErrorForm] = useState("");

    useEffect(() => {
        const controller = new AbortController();
        async function cargarDatos() {
        setCargando(true);
        setError(""); 
        try {
            const relaciones = await listarMisComplejos(controller.signal);
            if (relaciones.length > 0) {
            const id = relaciones[0].idComplejo;
            setIdComplejo(id);
            const datos = await listarCanchas(id, controller.signal);
            if (!controller.signal.aborted) setCanchas(datos);
            } else {
            if (!controller.signal.aborted) setError("No tienes ningún complejo asignado.");
            }
        } catch (err) {
            if (!controller.signal.aborted) setError(err.message);
        } finally {
            if (!controller.signal.aborted) setCargando(false);
        }
        }
        cargarDatos();
        return () => controller.abort();
    }, [intento]);

    const reintentar = () => {
        setError("");
        setCargando(true);
        setIntento((n) => n + 1);
    };

    const abrirCrear = () => {
        setCanchaSeleccionada(null);
        setForm({ nombre: "", precioHora: "", capacidad: "", estado: "ACTIVA" });
        setErrorForm("");
        setModalFormAbierto(true);
    };

    const abrirEditar = (cancha) => {
        setCanchaSeleccionada(cancha);
        setForm({
            nombre: cancha.nombre,
            precioHora: cancha.precioHora,
            capacidad: String(cancha.capacidad ?? ""),
            estado: cancha.estado,
        });
        setErrorForm("");
        setModalFormAbierto(true);
    };

    const abrirDetalles = (cancha) => {
        setCanchaSeleccionada(cancha);
        setModalDetalleAbierto(true);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();
        if (enviando) return;
        const capacidad = form.capacidad.trim() === "" ? NaN : Number(form.capacidad);
        if (!Number.isInteger(capacidad) || capacidad <= 0) {
            setErrorForm("La capacidad debe ser un número entero positivo.");
            return;
        }
        setEnviando(true);
        setErrorForm("");
        
        try {
        const payload = { ...form, precioHora: parseFloat(form.precioHora), capacidad };
        
        if (canchaSeleccionada) {
            const actualizada = await modificarCancha(canchaSeleccionada.idCancha, payload);
            setCanchas((prev) => prev.map((c) => c.idCancha === actualizada.idCancha ? actualizada : c));
            setMensaje("Cancha actualizada correctamente.");
        } else {
            const nueva = await registrarCancha(idComplejo, payload);
            setCanchas((prev) => [...prev, nueva]);
            setMensaje("Cancha creada correctamente.");
        }
        setModalFormAbierto(false);
        } catch (err) {
        setErrorForm(err.message);
        } finally {
        setEnviando(false);
        }
    };

    const handleEliminarConfirm = async () => {
        if (!canchaAEliminar) return;
        try {
        const nuevoEstado = canchaAEliminar.estado === "ACTIVA" ? "INACTIVA" : "ACTIVA";
        const actualizada = await cambiarEstadoCancha(canchaAEliminar.idCancha, nuevoEstado);
        setCanchas((prev) => prev.map((c) => c.idCancha === actualizada.idCancha ? actualizada : c));
        setCanchaAEliminar(null);
        setMensaje(`Cancha ${nuevoEstado === "ACTIVA" ? "activada" : "desactivada"} correctamente.`);
        } catch (err) {
        alert(err.message);
        }
    };

    const visibles = canchas.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    const columns = [
        {
        key: "nombre",
        label: "CANCHA",
        width: "3fr",
        render: (item) => (
            <div className="dash-admins-info">
            <span className="dash-admins-nombre">{item.nombre}</span>
            </div>
        ),
        },
        {
        key: "estado",
        label: "ESTADO",
        width: "1fr",
        render: (item) => (
            <span className={`usuarios-status ${item.estado === "ACTIVA" ? "is-active" : ""}`}>
            {item.estado === "ACTIVA" ? "Activa" : "Inactiva"}
            </span>
        ),
        },
        {
        key: "acciones",
        label: "ACCIONES",
        width: "1fr",
        align: "right",
        render: (item) => (
            <TableActions>
            <ViewActionButton onClick={() => abrirDetalles(item)} />
            <EditActionButton onClick={() => abrirEditar(item)} />
            <DeleteActionButton 
                onClick={() => setCanchaAEliminar(item)} 
                title={item.estado === "ACTIVA" ? "Desactivar" : "Activar"}
                disabled={false}
            />
            </TableActions>
        ),
        },
    ];

    // ✅ FE-09: separar error de negocio (no se resuelve reintentando)
    //           de error de red/servidor (sí se resuelve reintentando)
    if (error) {
        const esSinComplejo = error.startsWith("No tienes ningún complejo");
        return (
            <div style={{ padding: "40px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
                <StatusMessage message={error} />
                {!esSinComplejo && <Button onClick={reintentar}>Reintentar</Button>}
            </div>
        );
    }

    return (
        <>
        <section className="dash-complejos-header">
            <div className="dash-complejos-header-info">
            <PageHeader
                title="Canchas"
                description="Administra las canchas deportivas de tu complejo, sus precios y disponibilidad."
                badge="ADMINISTRADOR DE COMPLEJO"
            />
            </div>
            <div className="mi-complejo-header-actions">
                <Link className="dash-complejos-new" to="/dashboard/mi-complejo/horarios">
                    <span>Configurar horarios</span>
                </Link>
                <button className="dash-complejos-new" onClick={abrirCrear} type="button">
                    <PlusIcon />
                    <span>Nueva cancha</span>
                </button>
            </div>
        </section>

        <section className="dash-admins-card" aria-busy={cargando}>
            <div className="dash-admins-toolbar">
            <div className="dash-admins-filters">
                <div className="dash-admins-toolbar-left">
                <span className="dash-admins-toolbar-icon" aria-hidden="true"><PlusIcon /></span>
                <span className="dash-admins-toolbar-title">Canchas registradas</span>
                <span className="dash-admins-toolbar-badge">{visibles.length}</span>
                </div>
            </div>

            <div className="dash-admins-search">
                <span className="dash-admins-search-icon" aria-hidden="true"><SearchIcon /></span>
                <input
                type="search"
                placeholder="Buscar cancha por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                />
            </div>
            </div>

            <DataTable
            columns={columns}
            data={visibles}
            loading={cargando}
            emptyMessage="No se encontraron canchas registradas."
            />

            <div className="dash-admins-paginator">
            <span className="dash-admins-paginator-info">
                Mostrando {visibles.length} de {canchas.length} canchas en total.
            </span>
            </div>
        </section>

        <StatusMessage message={mensaje} type="exito" />

        {modalFormAbierto && (
            <FormCanchaModal
            cancha={canchaSeleccionada}
            onClose={() => setModalFormAbierto(false)}
            onSubmit={handleGuardar}
            enviando={enviando}
            error={errorForm}
            form={form}
            setForm={setForm}
            />
        )}

        {modalDetalleAbierto && (
            <DetalleCanchaModal
            cancha={canchaSeleccionada}
            onClose={() => setModalDetalleAbierto(false)}
            />
        )}

        <ConfirmDialog
            isOpen={Boolean(canchaAEliminar)}
            title={canchaAEliminar?.estado === "ACTIVA" ? "Desactivar cancha" : "Activar cancha"}
            message={`¿Estás seguro de ${canchaAEliminar?.estado === "ACTIVA" ? "desactivar" : "activar"} la cancha ${canchaAEliminar?.nombre}?`}
            confirmText="Sí, confirmar"
            onConfirm={handleEliminarConfirm}
            onCancel={() => setCanchaAEliminar(null)}
            danger={canchaAEliminar?.estado === "ACTIVA"}
        />
        </>
    );
}