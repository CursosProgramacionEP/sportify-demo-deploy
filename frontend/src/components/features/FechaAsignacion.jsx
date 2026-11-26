const formatoFecha = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * Presenta una fecha de calendario ISO sin desplazarla por la zona del navegador.
 * @param {object} props Fecha YYYY-MM-DD de la asociación, no del usuario.
 * @returns {import('react').ReactElement} Fecha o indicación de dato no registrado.
 * @author Equipo Sportify
 */
export default function FechaAsignacion({ fecha }) {
  const date = typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha)
    ? new Date(`${fecha}T00:00:00Z`)
    : null;

  if (!date || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== fecha) {
    return <span className="dash-admins-texto">Sin fecha registrada</span>;
  }

  return <time className="dash-admins-texto" dateTime={fecha}>{formatoFecha.format(date)}</time>;
}
