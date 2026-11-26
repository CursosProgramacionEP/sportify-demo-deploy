import { useEffect, useState } from "react";
import FormField from "../ui/FormField";
import StatusMessage from "../ui/StatusMessage";
import { obtenerDisponibilidad } from "../../services/api";
import { hoyISO } from "../../utils/fechas";
import "./SelectorHorarios.css";

/**
 * Elige fecha y una franja libre de una cancha.
 * @param {object} props
 * @param {number} props.idCancha cancha consultada
 * @param {string} props.fecha fecha elegida (YYYY-MM-DD)
 * @param {(fecha: string) => void} props.onFechaChange cambio de fecha
 * @param {{horaInicio: string, horaFin: string}|null} props.seleccion franja elegida
 * @param {(slot: object) => void} props.onSeleccion se eligió una franja
 * @param {number} [props.version] súbelo para volver a consultar la disponibilidad
 */
export default function SelectorHorarios({
  idCancha, fecha, onFechaChange, seleccion, onSeleccion, version = 0,
}) {
  const [resultado, setResultado] = useState({ fecha: "", horarios: [], error: "" });

  useEffect(() => {
    if (!fecha) return;
    const controller = new AbortController();
    obtenerDisponibilidad(idCancha, fecha, controller.signal)
      .then((horarios) => setResultado({ fecha, horarios, error: "" }))
      .catch((err) => {
        if (!controller.signal.aborted) setResultado({ fecha, horarios: [], error: err.message });
      });
    return () => controller.abort();
  }, [idCancha, fecha, version]);

  // Mientras la respuesta no sea de la fecha elegida, seguimos "cargando".
  const cargando = Boolean(fecha) && resultado.fecha !== fecha;
  const libres = resultado.horarios.filter((hora) => hora.disponible);

  return (
    <>
      <FormField label="Fecha" type="date" min={hoyISO()} value={fecha}
        onChange={(e) => onFechaChange(e.target.value)} />

      {!fecha && <p>Elige una fecha para ver las horas libres.</p>}
      {cargando && <p role="status">Buscando horarios...</p>}
      {!cargando && <StatusMessage message={resultado.error} />}
      {!cargando && fecha && !resultado.error && libres.length === 0 && (
        <p>No hay horas libres para esta fecha.</p>
      )}

      {!cargando && libres.length > 0 && (
        <ul className="horarios-libres">
          {libres.map((hora) => {
            const activa = seleccion?.horaInicio === hora.horaInicio;
            return (
              <li key={hora.horaInicio}>
                <button
                  type="button"
                  className={`horario-slot${activa ? " is-selected" : ""}`}
                  aria-pressed={activa}
                  onClick={() => onSeleccion(hora)}
                >
                  {hora.horaInicio} - {hora.horaFin}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}