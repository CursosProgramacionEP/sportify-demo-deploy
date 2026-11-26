import { roleConfig, roleLabel } from "../../utils/roles";

/**
 * Chip compacto con la etiqueta legible de un rol.
 *
 * @param {{ role: string, className?: string }} props
 */
export function RoleBadge({ role, className = "" }) {
    return (
        <span className={["usuarios-role", className].filter(Boolean).join(" ")}>
        {roleLabel(role)}
        </span>
    );
    }

    /**
     * Lista de chips para todos los roles de un usuario.
     *
     * @param {{ roles: string[], className?: string }} props
     */
    export function RolesList({ roles, className = "" }) {
    if (!Array.isArray(roles) || roles.length === 0) return null;
    return (
        <div className={className}>
        {roles.map((r) => <RoleBadge key={r} role={r} />)}
        </div>
    );
    }

    /**
     * Chip con color según el tono del rol (cyan/violet/green).
     * Útil para el perfil de Configuración donde el color aporta jerarquía visual.
     *
     * @param {{ role: string }} props
     */
    export function RoleChipTone({ role }) {
    const { label, tone } = roleConfig(role);
    return (
        <span className={`config-badge ${tone}`}>
        {label}
        </span>
    );
    }