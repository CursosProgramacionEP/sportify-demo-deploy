import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { listarUsuarios, editarUsuario, cambiarEstadoUsuario, cambiarRolPlataforma } from "../../services/api";
import { ROLES, roleLabel } from "../../utils/roles";
import StatusMessage from "../../components/ui/StatusMessage";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import EditarUsuarioModal from "../../components/features/EditarUsuarioModal";
import TableActions, { EditActionButton } from "../../components/ui/TableActions";
import { RolesList } from "../../components/ui/RoleBadge";
import "./Administradores.css";
import "./Usuarios.css";

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
}
function ChevronDownIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>;
}

export default function Usuarios() {
  const { usuario: actual } = useOutletContext();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("");
  const [rol, setRol] = useState("");
  
  const [intento, setIntento] = useState(0);
  
  const [edicion, setEdicion] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    listarUsuarios(controller.signal).then((datos) => {
      if (!controller.signal.aborted) setUsuarios(datos);
    }).catch((err) => { if (!controller.signal.aborted) setError(err.message); })
      .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [intento]);

  const handleEditarUsuario = async (id, datos) => {
    const actualizado = await editarUsuario(id, datos);
    setUsuarios((lista) => lista.map((item) => item.idUsuario === id ? actualizado : item));
    setMensaje("Los datos del usuario se actualizaron correctamente.");
  };

  const handleConfirmarAccion = async () => {
    if (!confirmacion) return;
    setProcesando(true);
    try {
      const { usuario, tipo, valor } = confirmacion;
      const resultado = tipo === "estado" 
        ? await cambiarEstadoUsuario(usuario.idUsuario, valor) 
        : await cambiarRolPlataforma(usuario.idUsuario, valor);
        
      setUsuarios((lista) => lista.map((item) => item.idUsuario === resultado.idUsuario ? resultado : item));
      setConfirmacion(null);
      setMensaje("Los cambios del usuario se guardaron correctamente.");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setProcesando(false);
    }
  };

  const q = busqueda.trim().toLocaleLowerCase("es-PE");
  const visibles = usuarios.filter((usuario) => (!estado || usuario.estado === estado)
    && (!rol || usuario.roles?.includes(rol))
    && `${usuario.nombres} ${usuario.apellidos} ${usuario.correo}`.toLocaleLowerCase("es-PE").includes(q));

  const columns = [
    {
      key: "usuario",
      label: "USUARIO",
      width: "1.5fr",
      render: (item) => {
        const propio = item.idUsuario === actual.idUsuario;
        return (
          <div className="usuarios-identity">
            <span className="dash-admins-avatar is-cyan" aria-hidden="true">
              {`${item.nombres?.[0] || ""}${item.apellidos?.[0] || ""}`.toLocaleUpperCase("es-PE")}
            </span>
            <div className="dash-admins-info">
              <span className="dash-admins-nombre">{item.nombres} {item.apellidos}</span>
              <small style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
                #{item.idUsuario}{propio ? " · Tu cuenta" : ""}
              </small>
            </div>
          </div>
        );
      },
    },
    {
      key: "contacto",
      label: "CONTACTO",
      width: "1.3fr",
      render: (item) => (
        <div className="dash-admins-info">
          <span className="dash-admins-texto">{item.correo}</span>
          <small style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>
            {item.telefono || "Sin teléfono registrado"}
          </small>
        </div>
      ),
    },
    {
      key: "roles",
      label: "ROLES",
      width: "1.2fr",
      render: (item) => <RolesList roles={item.roles} className="usuarios-roles" />,
    },
    {
      key: "estado",
      label: "ESTADO",
      width: "0.8fr",
      render: (item) => (
        <span className={`usuarios-status ${item.estado === "ACTIVO" ? "is-active" : ""}`}>
          {item.estado === "ACTIVO" ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "ACCIONES",
      width: "1.5fr",
      align: "right",
      render: (item) => {
        const propio = item.idUsuario === actual.idUsuario;
        const administrador = item.roles?.includes("ADMIN_PLATAFORMA");
        
        if (propio) {
          return (
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
              <span style={{ 
                color: "var(--color-text-muted)", 
                fontSize: "12px", 
                fontStyle: "italic" 
              }}>
                Tu cuenta
              </span>
            </div>
          );
        }

        return (
          <TableActions>
            <EditActionButton onClick={() => { setMensaje(""); setEdicion(item); }} />
            
            <button 
              type="button"
              className="dash-admins-remove-btn" 
              onClick={() => { 
                setMensaje(""); 
                setConfirmacion({ 
                  usuario: item, 
                  tipo: "estado", 
                  valor: item.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO", 
                  titulo: item.estado === "ACTIVO" ? "Desactivar cuenta" : "Activar cuenta",
                  mensaje: item.estado === "ACTIVO" ? "La cuenta perderá el acceso al sistema." : "La cuenta podrá volver a iniciar sesión."
                }); 
              }}
            >
              {item.estado === "ACTIVO" ? "Desactivar" : "Activar"}
            </button>
            
            <button 
              type="button"
              className="dash-admins-remove-btn" 
              disabled={!administrador && item.estado !== "ACTIVO"}
              onClick={() => { 
                setMensaje(""); 
                setConfirmacion({ 
                  usuario: item, 
                  tipo: "rol", 
                  valor: !administrador, 
                  titulo: administrador ? "Retirar administración" : "Conceder administración",
                  mensaje: administrador ? "Se retirará el acceso al panel de administración." : "Esta persona podrá gestionar usuarios y acceder a todas las funciones del panel."
                }); 
              }}
            >
              {administrador ? "Retirar rol" : "Hacer admin"}
            </button>
          </TableActions>
        );
      },
    },
  ];

  return (
    <div className="usuarios-page">
      <section className="dash-complejos-header">
        <div className="dash-complejos-header-info">
          <PageHeader
            title="Gestión de usuarios"
            description="Consulta las cuentas, actualiza sus datos y controla quién puede acceder a la plataforma."
          />
        </div>
      </section>

      <StatusMessage message={mensaje} type="exito" />

      <section className="dash-admins-card usuarios-card" aria-busy={cargando}>
        <div className="dash-admins-toolbar">
          <div className="dash-admins-filters">
            <div className="dash-complejos-dropdown-wrap">
              <label htmlFor="estado-filter" className="dash-complejos-dropdown-label">ESTADO:</label>
              <div className="dash-complejos-select-wrap">
                <select
                  id="estado-filter"
                  className="dash-complejos-dropdown"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="ACTIVO">Activos</option>
                  <option value="INACTIVO">Inactivos</option>
                </select>
                <span className="dash-complejos-select-arrow" aria-hidden="true"><ChevronDownIcon /></span>
              </div>
            </div>
            
            <div className="dash-complejos-dropdown-wrap">
              <label htmlFor="rol-filter" className="dash-complejos-dropdown-label">ROL:</label>
              <div className="dash-complejos-select-wrap">
                <select
                  id="rol-filter"
                  className="dash-complejos-dropdown"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                >
                  <option value="">Todos</option>
                  {Object.values(ROLES).map((value) => (
                    <option key={value} value={value}>{roleLabel(value)}</option>
                  ))}
                </select>
                <span className="dash-complejos-select-arrow" aria-hidden="true"><ChevronDownIcon /></span>
              </div>
            </div>
          </div>
          
          <div className="dash-admins-search">
            <span className="dash-admins-search-icon" aria-hidden="true"><SearchIcon /></span>
            <input
              aria-label="Buscar usuario por nombre o correo"
              type="search"
              placeholder="Buscar usuario, correo..."
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
          onRetry={() => { setError(""); setCargando(true); setIntento((n) => n + 1); }}
          emptyMessage={
            usuarios.length === 0 
              ? "No hay usuarios registrados en el sistema." 
              : "No hay usuarios que coincidan con los filtros."
          }
        />
        
        <div className="dash-admins-paginator">
          <span className="dash-admins-paginator-info">
            Mostrando {visibles.length} de {usuarios.length} usuarios.
          </span>
        </div>
      </section>

      {edicion && (
        <EditarUsuarioModal 
          usuario={edicion} 
          onClose={() => setEdicion(null)} 
          onSubmit={handleEditarUsuario} 
        />
      )}
      <ConfirmDialog
        isOpen={Boolean(confirmacion)}
        title={confirmacion?.titulo}
        message={confirmacion?.mensaje}
        confirmText="Sí, confirmar"
        onConfirm={handleConfirmarAccion}
        onCancel={() => setConfirmacion(null)}
        busy={procesando}
        danger={confirmacion?.valor === "INACTIVO" || confirmacion?.valor === false} 
      />
    </div>
  );
}