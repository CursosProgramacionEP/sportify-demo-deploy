import { useEffect, useState } from "react";
    import "./Administradores.css";
    import {
    asociarAdministradorComplejo,
    editarUsuario,
    listarTodosAdministradores,
    listarComplejos,
    listarUsuarios,
    quitarAdministradorComplejo,
    } from "../../services/api";
    import PageHeader from "../../components/ui/PageHeader";
    import DataTable from "../../components/ui/DataTable";
    import AsociarAdministradorModal from "../../components/features/AsociarAdministradorModal";
    import EditarUsuarioModal from "../../components/features/EditarUsuarioModal";
    import FechaAsignacion from "../../components/features/FechaAsignacion";
    import ConfirmDialog from "../../components/ui/ConfirmDialog";
    import TableActions, { EditActionButton, DeleteActionButton } from "../../components/ui/TableActions";

    function SearchIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    }
    function PlusUserIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="4" /><path d="M2 21v-1a7 7 0 0 1 7-7h1" /><path d="M18 10v8M14 14h8" /></svg>;
    }
    function ChevronDownIcon() {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
    }

    function getInitials(nombre) {
    return nombre.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
    }

    function avatarTone(nombre) {
    const tones = ["cyan", "violet", "green", "amber"];
    const sum = nombre.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return tones[sum % tones.length];
    }

    export default function Administradores() {
    const [complejos, setComplejos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [relaciones, setRelaciones] = useState([]);
    
    const [busquedaAdmin, setBusquedaAdmin] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("Todos");
    
    const [modalAbierto, setModalAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState(null);
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [errorDatos, setErrorDatos] = useState("");
    
    const [intento, setIntento] = useState(0);
    const [usuarioEnProceso, setUsuarioEnProceso] = useState(null);
    const [adminAQuitar, setAdminAQuitar] = useState(null); 

    useEffect(() => {
        const controller = new AbortController();
        async function cargarDatos() {
        setErrorDatos("");
        setCargandoDatos(true);
        try {
            const [complejosServidor, usuariosServidor, relacionesServidor] = await Promise.all([
            listarComplejos(controller.signal),
            listarUsuarios(controller.signal),
            listarTodosAdministradores(controller.signal),
            ]);
            if (controller.signal.aborted) return;
            setComplejos(complejosServidor);
            setUsuarios(usuariosServidor);
            setRelaciones(relacionesServidor);
        } catch (error) {
            if (!controller.signal.aborted) setErrorDatos(error.message);
        } finally {
            if (!controller.signal.aborted) setCargandoDatos(false);
        }
        }
        cargarDatos();
        return () => controller.abort();
    }, [intento]);

    const administradores = relaciones.flatMap((relacion) => {
        const usuario = usuarios.find((item) => item.idUsuario === relacion.idUsuario);
        const complejo = complejos.find((item) => item.idComplejo === relacion.idComplejo);

        if (!usuario || !complejo) return [];
        
        return [{
        ...relacion,
        id: `${relacion.idComplejo}-${relacion.idUsuario}`,
        nombre: `${usuario.nombres} ${usuario.apellidos}`.trim(),
        correo: usuario.correo,
        telefono: usuario.telefono,
        estado: usuario.estado || "ACTIVO",
        complejoNombre: complejo.nombre,
        complejoDireccion: complejo.direccion,
        }];
    });

    // 3. Filtrado y Búsqueda
    const visibles = administradores.filter((a) => {
        if (filtroEstado === "Activos" && a.estado !== "ACTIVO") return false;
        if (filtroEstado === "Inactivos" && a.estado !== "INACTIVO") return false;
        
        if (busquedaAdmin.trim()) {
        const q = busquedaAdmin.toLowerCase();
        return (
            a.nombre.toLowerCase().includes(q) || 
            a.correo.toLowerCase().includes(q) ||
            a.complejoNombre.toLowerCase().includes(q)
        );
        }
        return true;
    });

    const totalActivos = administradores.filter(a => a.estado === "ACTIVO").length;
    const totalInactivos = administradores.length - totalActivos;

    // Handlers
    const handleAsociar = async ({ complejoId, idUsuario }) => {
        await asociarAdministradorComplejo(complejoId, idUsuario);
        setIntento((actual) => actual + 1); 
    };

    const handleQuitarConfirm = async () => {
        if (!adminAQuitar) return;
        setUsuarioEnProceso(adminAQuitar.idUsuario);
        try {
        await quitarAdministradorComplejo(adminAQuitar.idComplejo, adminAQuitar.idUsuario);
        setRelaciones((actuales) => actuales.filter(
            (item) => !(item.idComplejo === adminAQuitar.idComplejo && item.idUsuario === adminAQuitar.idUsuario)
        ));
        setAdminAQuitar(null);
        } catch (error) {
        alert(error.message);
        } finally {
        setUsuarioEnProceso(null);
        }
    };

    const handleEditarUsuario = async (id, datos) => {
        const actualizado = await editarUsuario(id, datos);
        setUsuarios((lista) => lista.map((u) => u.idUsuario === id ? actualizado : u));
    };

    function reintentarDatos() {
        setIntento((actual) => actual + 1);
    }

    const columns = [
        {
        key: "nombre",
        label: "ADMINISTRADOR",
        width: "1.5fr",
        render: (item) => (
            <div className="dash-admins-col-nombre">
            <span className={`dash-admins-avatar is-${avatarTone(item.nombre)}`} aria-hidden="true">
                {getInitials(item.nombre)}
            </span>
            <div className="dash-admins-info">
                <span className="dash-admins-nombre">{item.nombre}</span>
                <span className={`dash-complejos-status ${item.estado === "ACTIVO" ? "is-active" : "is-inactive"}`}>
                <span className="dash-complejos-status-dot" aria-hidden="true" />
                {item.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                </span>
            </div>
            </div>
        ),
        },
        {
        key: "complejo",
        label: "COMPLEJO ASIGNADO",
        width: "1.5fr",
        render: (item) => (
            <div className="dash-admins-info">
            <span className="dash-admins-nombre">{item.complejoNombre}</span>
            <span className="dash-admins-texto" style={{ fontSize: "12px" }}>{item.complejoDireccion}</span>
            </div>
        ),
        },
        {
        key: "contacto",
        label: "CONTACTO",
        width: "1.5fr",
        render: (item) => (
            <div className="dash-admins-info">
            <span className="dash-admins-texto">{item.correo}</span>
            <span className="dash-admins-texto" style={{ fontSize: "12px" }}>{item.telefono || "Sin teléfono"}</span>
            </div>
        ),
        },
        {
        key: "fecha",
        label: "FECHA ASIGNACIÓN",
        width: "1fr",
        render: (item) => <FechaAsignacion fecha={item.fechaAsignacion} />,
        },
        {
        key: "acciones",
        label: "ACCIONES",
        width: "0.8fr",
        align: "right",
        render: (item) => (
            <TableActions>
            <EditActionButton onClick={() => setUsuarioEditando(usuarios.find((u) => u.idUsuario === item.idUsuario))} />
            <DeleteActionButton 
                onClick={() => setAdminAQuitar({ 
                idComplejo: item.idComplejo, 
                idUsuario: item.idUsuario, 
                nombre: item.nombre 
                })} 
                disabled={usuarioEnProceso === item.idUsuario}
                title="Quitar"
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
                title="Administradores de complejo"
                description="Visualiza y gestiona todos los administradores asignados a los complejos de la plataforma."
            />
            </div>
            <button
            className="dash-complejos-new"
            type="button"
            onClick={() => setModalAbierto(true)}
            disabled={cargandoDatos || !complejos.length || !usuarios.length}
            >
            <PlusUserIcon />
            <span>Asociar administrador</span>
            </button>
        </section>

        <section className="dash-admins-card" aria-busy={cargandoDatos}>
            <div className="dash-admins-toolbar">
            <div className="dash-admins-filters">
                <div className="dash-admins-toolbar-left">
                <span className="dash-admins-toolbar-icon" aria-hidden="true"><PlusUserIcon /></span>
                <span className="dash-admins-toolbar-title">Todos los administradores</span>
                <span className="dash-admins-toolbar-badge">{visibles.length}</span>
                </div>

                <div className="dash-complejos-dropdown-wrap">
                <label htmlFor="estado-filter-admin" className="dash-complejos-dropdown-label">ESTADO:</label>
                <div className="dash-complejos-select-wrap">
                    <select
                    id="estado-filter-admin"
                    className="dash-complejos-dropdown"
                    disabled={cargandoDatos}
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
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
                    { key: "Todos", count: administradores.length },
                    { key: "Activos", count: totalActivos },
                    { key: "Inactivos", count: totalInactivos },
                ].map(({ key, count }) => (
                    <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={filtroEstado === key}
                    className={`dash-complejos-segment ${filtroEstado === key ? "is-active" : ""}`}
                    disabled={cargandoDatos}
                    onClick={() => setFiltroEstado(key)}
                    >
                    {key} ({count})
                    </button>
                ))}
                </div>
            </div>

            <div className="dash-admins-search">
                <span className="dash-admins-search-icon" aria-hidden="true"><SearchIcon /></span>
                <input
                type="search"
                placeholder="Buscar por admin, correo o complejo..."
                value={busquedaAdmin}
                onChange={(e) => setBusquedaAdmin(e.target.value)}
                disabled={cargandoDatos}
                />
            </div>
            </div>

            <DataTable
            columns={columns}
            data={visibles}
            loading={cargandoDatos}
            error={errorDatos}
            onRetry={reintentarDatos}
            emptyMessage={
                relaciones.length === 0 
                ? "No hay administradores asignados en el sistema."
                : "No se encontraron administradores que coincidan con la búsqueda."
            }
            />

            <div className="dash-admins-paginator">
            <span className="dash-admins-paginator-info">
                Mostrando {visibles.length} de {administradores.length} asignaciones en total.
            </span>
            </div>
        </section>

        {modalAbierto && (
            <AsociarAdministradorModal
            complejos={complejos}
            usuarios={usuarios}
            complejoInicial={null}
            onClose={() => setModalAbierto(false)}
            onSubmit={handleAsociar}
            />
        )}

        {usuarioEditando && (
            <EditarUsuarioModal
                usuario={usuarioEditando}
                onClose={() => setUsuarioEditando(null)}
                onSubmit={handleEditarUsuario}
            />
        )}

        <ConfirmDialog
            isOpen={Boolean(adminAQuitar)}
            title="Quitar administrador"
            message={`¿Estás seguro de quitar a ${adminAQuitar?.nombre} como administrador de este complejo?`}
            confirmText="Sí, quitar"
            onConfirm={handleQuitarConfirm}
            onCancel={() => setAdminAQuitar(null)}
            busy={usuarioEnProceso === adminAQuitar?.idUsuario}
            danger={true}
        />
        </>
    );
    }