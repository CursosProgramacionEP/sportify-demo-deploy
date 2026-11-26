import { useState } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import StatusMessage from "../ui/StatusMessage";
import SelectorHorarios from "./SelectorHorarios";
import { modificarReserva } from "../../services/api";

/**
 * Cambia la fecha o franja de una reserva.
 * @param {object} props
 * @param {object} props.reserva reserva a modificar (ReservaResumen)
 * @param {() => void} props.onClose cierra sin guardar
 * @param {() => void} props.onGuardado se llama tras guardar con éxito
 */
export default function ModificarReservaModal({ reserva, onClose, onGuardado }) {
  const [fecha, setFecha] = useState(reserva.fecha);
  const [seleccion, setSeleccion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiarFecha = (nueva) => {
    setFecha(nueva);
    setSeleccion(null);
    setError("");
  };

  const handleGuardar = async () => {
    if (!seleccion) return;
    setGuardando(true);
    setError("");
    try {
      await modificarReserva(reserva.idReserva, {
        fecha,
        horaInicio: seleccion.horaInicio,
        horaFin: seleccion.horaFin,
      });
      onGuardado();
    } catch (err) {
      setError(err.message);
      setGuardando(false);
    }
  };

  return (
    <Modal title={`Modificar reserva - ${reserva.nombreCancha}`} onClose={onClose} busy={guardando}>
      <p className="dash-modal-subtitle">
        Elige la nueva fecha y hora. Si la reserva estaba confirmada, volverá a quedar pendiente.
      </p>

      <SelectorHorarios
        idCancha={reserva.idCancha}
        fecha={fecha}
        onFechaChange={cambiarFecha}
        seleccion={seleccion}
        onSeleccion={setSeleccion}
      />

      <StatusMessage message={error} />

      <div className="sportify-dialog-actions">
        <Button variant="secondary" onClick={onClose} disabled={guardando}>Cancelar</Button>
        <Button onClick={handleGuardar} disabled={!seleccion} loading={guardando} loadingLabel="Guardando...">
          Guardar cambios
        </Button>
      </div>
    </Modal>
  );
}