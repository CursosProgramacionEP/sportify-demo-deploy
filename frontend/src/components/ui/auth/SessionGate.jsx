import { useEffect, useState } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import { obtenerSesion } from "../../../services/api";
import AuthLayout from "../../../layouts/AuthLayout";
import StatusMessage from "../StatusMessage";
import Button from "../Button";

/**
 * Verifica la sesión con el servidor antes de montar las páginas protegidas.
 * @param {object} props
 * @param {string[]} [props.rolesPermitidos] Lista de roles que pueden acceder. Si está vacía, cualquier logueado entra.
 */
export default function SessionGate({ rolesPermitidos = [] }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    obtenerSesion(controller.signal).then((datos) => {
      if (!controller.signal.aborted) { setUsuario(datos); setError(""); }
    }).catch((err) => {
      if (controller.signal.aborted) return;
      if (err.status === 401) { setUsuario(null); setError(""); }
      else setError(err.message);
    }).finally(() => { if (!controller.signal.aborted) setCargando(false); });
    return () => controller.abort();
  }, [intento]);

  useEffect(() => {
    const revisar = () => { setCargando(true); setIntento((n) => n + 1); };
    window.addEventListener("sportify:revisar-sesion", revisar);
    return () => window.removeEventListener("sportify:revisar-sesion", revisar);
  }, []);

  if (cargando) return <AuthLayout title="Verificando acceso"><p role="status">Cargando tu sesión...</p></AuthLayout>;
  if (error) return <AuthLayout title="No pudimos verificar tu acceso">
    <StatusMessage message={error} />
    <Button onClick={() => { setCargando(true); setIntento((n) => n + 1); }}>Reintentar</Button>
  </AuthLayout>;
  if (!usuario) return <Navigate to="/login" replace />;
  
  // Validar si el usuario tiene al menos uno de los roles permitidos
  if (rolesPermitidos.length > 0) {
    const tienePermiso = rolesPermitidos.some(rol => usuario.roles.includes(rol));
    if (!tienePermiso) {
      return <AuthLayout title="Acceso restringido">
        <p>No tienes los permisos necesarios para ver esta sección.</p>
        <Link to="/cuenta">Ir a mi cuenta</Link>
      </AuthLayout>;
    }
  }

  return <Outlet context={{ usuario }} />;
}