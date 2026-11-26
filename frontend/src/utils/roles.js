/**
 * Catálogo y utilidades de roles. Sin JSX, sin React.
 * Este archivo NO exporta componentes → seguro para Fast Refresh.
 *
 * @author Equipo Sportify
 */
export const ROLES = {
    CLIENTE: "CLIENTE",
    ADMIN_PLATAFORMA: "ADMIN_PLATAFORMA",
    ADMIN_COMPLEJO: "ADMIN_COMPLEJO",
    };

    export const ROL_CONFIG = {
    CLIENTE: {
        label: "Cliente",
        header: "CLIENTE",
        tone: "is-cyan",
    },
    ADMIN_PLATAFORMA: {
        label: "Administrador del sistema",
        header: "ADMINISTRADOR DE PLATAFORMA",
        tone: "is-violet",
    },
    ADMIN_COMPLEJO: {
        label: "Administrador de complejo",
        header: "ADMINISTRADOR DE COMPLEJO",
        tone: "is-green",
    },
    };

    const JERARQUIA = [ROLES.ADMIN_PLATAFORMA, ROLES.ADMIN_COMPLEJO, ROLES.CLIENTE];

    /**
     * Devuelve la configuración de un rol, con fallback para códigos desconocidos.
     *
     * @param {string} code
     * @returns {{ label: string, header: string, tone: string }}
     */
    export function roleConfig(code) {
    return ROL_CONFIG[code] ?? {
        label: code,
        header: String(code ?? "").toUpperCase(),
        tone: "",
    };
    }

    /**
     * Devuelve la etiqueta legible de un rol: "Administrador del sistema".
     *
     * @param {string} code
     * @returns {string}
     */
    export function roleLabel(code) {
    return roleConfig(code).label;
    }

    /**
     * Devuelve la etiqueta de header: "ADMINISTRADOR DE PLATAFORMA".
     *
     * @param {string} code
     * @returns {string}
     */
    export function roleHeaderLabel(code) {
    return roleConfig(code).header;
    }

    /**
     * Devuelve el rol de mayor jerarquía en la lista.
     *
     * @param {string[]} roles
     * @returns {string|undefined}
     */
    export function primaryRole(roles) {
    if (!Array.isArray(roles) || roles.length === 0) return undefined;
    return JERARQUIA.find((r) => roles.includes(r)) ?? roles[0];
    }

    /**
     * Devuelve el header del rol principal de una lista: "ADMINISTRADOR DE PLATAFORMA".
     * Pensado para pasar directo al prop `badge` de `PageHeader`.
     *
     * @param {string[]} roles
     * @returns {string|null}
     */
    export function primaryRoleHeader(roles) {
    const principal = primaryRole(roles);
    return principal ? roleHeaderLabel(principal) : null;
    }