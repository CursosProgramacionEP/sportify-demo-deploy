/**
 * Utilidades de fecha y hora para reservas. Sin JSX, sin React.
 * @author Equipo Sportify
 */

/** Fecha de hoy en formato YYYY-MM-DD con la hora local (no UTC). */
export function hoyISO() {
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
    return ahora.toISOString().slice(0, 10);
}

/** "2026-11-05" -> "05/11/2026". */
export function formatoFecha(iso) {
    if (!iso) return "—";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

/** Recorta "18:00:00" a "18:00" (el backend puede enviar cualquiera de los dos). */
export function hhmm(hora) {
    return (hora ?? "").slice(0, 5);
}

/** true si la reserva ya empezó (no se puede modificar ni cancelar). */
export function yaComenzo(reserva) {
    return new Date(`${reserva.fecha}T${hhmm(reserva.horaInicio)}:00`) <= new Date();
}