import { Navigate, Outlet, useOutletContext } from "react-router-dom";

    /**
     * Protege rutas anidadas validando el rol en memoria (sin volver a consultar la sesión).
     */
    export default function RoleGuard({ rolesPermitidos = [] }) {
    const { usuario } = useOutletContext();

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    if (rolesPermitidos.length > 0) {
        const tienePermiso = rolesPermitidos.some((rol) => usuario.roles.includes(rol));
        if (!tienePermiso) {
        // Si no tiene permiso, lo devolvemos a su dashboard principal
        return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet context={{ usuario }} />;
    }