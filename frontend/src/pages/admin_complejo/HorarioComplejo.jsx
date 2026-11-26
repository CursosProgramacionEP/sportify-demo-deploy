import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import { guardarHorarios, listarHorarios, listarMisComplejos } from "../../services/api";
import "./HorarioComplejo.css";

// "clave" es el nombre del día que guarda el backend (sin tildes y en mayúsculas).
const DIAS_SEMANA = [
  { clave: "LUNES", nombre: "Lunes" },
  { clave: "MARTES", nombre: "Martes" },
  { clave: "MIERCOLES", nombre: "Miércoles" },
  { clave: "JUEVES", nombre: "Jueves" },
  { clave: "VIERNES", nombre: "Viernes" },
  { clave: "SABADO", nombre: "Sábado" },
  { clave: "DOMINGO", nombre: "Domingo" },
];

// El servidor envía "08:00:00"; el input type="time" necesita "08:00".
function recortarHora(hora) {
  if (Array.isArray(hora)) return hora.slice(0, 2).map((n) => String(n).padStart(2, "0")).join(":");
  return typeof hora === "string" ? hora.slice(0, 5) : "";
}

// El servidor solo guarda los días abiertos: si un día no viene en la lista, está cerrado.
// Un complejo que aún no configuró nada empieza con los 7 días abiertos y sin horas.
function desdeServidor(horarios) {
  return DIAS_SEMANA.map(({ clave, nombre }) => {
    const guardado = horarios.find((h) => h.diaSemana === clave);
    return {
      clave,
      dia: nombre,
      cerrado: horarios.length > 0 && !guardado,
      apertura: recortarHora(guardado?.horaApertura),
      cierre: recortarHora(guardado?.horaCierre),
    };
  });
}

function haciaServidor(horario) {
  return horario
    .filter((d) => !d.cerrado)
    .map((d) => ({ diaSemana: d.clave, horaApertura: d.apertura, horaCierre: d.cierre }));
}

function obtenerError(dia) {
  if (dia.cerrado) return "";
  if (!dia.apertura || !dia.cierre) return "Completa la hora de apertura y cierre.";
  if (dia.apertura >= dia.cierre) return "La apertura debe ser anterior al cierre.";
  return "";
}

export default function HorarioComplejo() {
  const [idComplejo, setIdComplejo] = useState(null);
  const [horario, setHorario] = useState(() => desdeServidor([]));
  const [guardado, setGuardado] = useState(() => desdeServidor([]));
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    async function cargar() {
      try {
        const relaciones = await listarMisComplejos(controller.signal);
        if (relaciones.length === 0) {
          setError("No tienes ningún complejo asignado.");
          return;
        }
        const id = relaciones[0].idComplejo;
        const dias = await listarHorarios(id, controller.signal);
        if (controller.signal.aborted) return;
        const cargado = desdeServidor(dias);
        setIdComplejo(id);
        setHorario(cargado);
        setGuardado(cargado);
      } catch (err) {
        if (!controller.signal.aborted) setError(err.message);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }
    cargar();
    return () => controller.abort();
  }, []);

  const errores = useMemo(() => horario.map(obtenerError), [horario]);
  const horarioValido = errores.every((e) => !e);
  const sinDiasAbiertos = horario.every((d) => d.cerrado);

  const actualizarDia = (indice, cambios) => {
    setHorario((actual) => actual.map((dia, i) => (i === indice ? { ...dia, ...cambios } : dia)));
    setMensaje("");
  };

  const restablecer = () => {
    setHorario(guardado);
    setIntentoGuardar(false);
    setError("");
    setMensaje("Se descartaron los cambios sin guardar.");
  };

  const guardar = async (evento) => {
    evento.preventDefault();
    setIntentoGuardar(true);
    if (sinDiasAbiertos) {
      setError("Debe haber al menos un día abierto.");
      return;
    }
    if (!horarioValido || guardando || !idComplejo) return;

    setGuardando(true);
    setError("");
    setMensaje("");
    try {
      const dias = await guardarHorarios(idComplejo, haciaServidor(horario));
      const actualizado = desdeServidor(dias);
      setHorario(actualizado);
      setGuardado(actualizado);
      setIntentoGuardar(false);
      setMensaje("Horario guardado correctamente.");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="horario-page">
      <PageHeader
        title="Horario del complejo"
        description="Configura las horas de atención para cada día de la semana."
        badge="ADMINISTRADOR DE COMPLEJO"
      />

      <section className="dash-admins-card horario-card">
        <div className="horario-card-heading">
          <div>
            <h2>Horario semanal</h2>
            <p>Estas horas definen las franjas que ven los clientes al consultar la disponibilidad.</p>
          </div>
        </div>

        {cargando && <p role="status">Cargando horario...</p>}
        {!cargando && !idComplejo && <StatusMessage message={error} />}

        {!cargando && idComplejo && (
          <form onSubmit={guardar}>
            <div className="horario-list" aria-label="Días de atención semanal">
              {horario.map((dia, indice) => {
                const mensajeError = errores[indice];
                const mostrarError = Boolean(mensajeError) && (intentoGuardar || dia.apertura || dia.cierre);
                const idError = `horario-error-${indice}`;
                return (
                  <fieldset className="horario-row" key={dia.clave} disabled={guardando}>
                    <legend className="horario-day-name">{dia.dia}</legend>
                    <label className="horario-time-field" htmlFor={`apertura-${indice}`}>
                      <span>Apertura</span>
                      <input
                        id={`apertura-${indice}`}
                        type="time"
                        value={dia.apertura}
                        disabled={dia.cerrado}
                        aria-invalid={mostrarError && (!dia.apertura || dia.apertura >= dia.cierre)}
                        aria-describedby={mostrarError ? idError : undefined}
                        onChange={(e) => actualizarDia(indice, { apertura: e.target.value })}
                      />
                    </label>
                    <label className="horario-time-field" htmlFor={`cierre-${indice}`}>
                      <span>Cierre</span>
                      <input
                        id={`cierre-${indice}`}
                        type="time"
                        value={dia.cierre}
                        disabled={dia.cerrado}
                        aria-invalid={mostrarError && (!dia.cierre || dia.apertura >= dia.cierre)}
                        aria-describedby={mostrarError ? idError : undefined}
                        onChange={(e) => actualizarDia(indice, { cierre: e.target.value })}
                      />
                    </label>
                    <label className="horario-closed-field">
                      <input
                        type="checkbox"
                        checked={dia.cerrado}
                        onChange={(e) => actualizarDia(indice, { cerrado: e.target.checked })}
                      />
                      <span>Cerrado</span>
                    </label>
                    <span className="horario-row-error" id={idError} role={mostrarError ? "alert" : undefined}>
                      {mostrarError ? mensajeError : ""}
                    </span>
                  </fieldset>
                );
              })}
            </div>

            <StatusMessage message={error} />
            <StatusMessage message={mensaje} type="exito" className="horario-feedback" />

            <div className="horario-actions">
              <Link className="horario-back-link" to="/dashboard/mi-complejo">Volver a Canchas</Link>
              <div className="horario-action-buttons">
                <Button variant="secondary" onClick={restablecer} disabled={guardando}>Restablecer</Button>
                <Button type="submit" loading={guardando} loadingLabel="Guardando...">Guardar horario</Button>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}