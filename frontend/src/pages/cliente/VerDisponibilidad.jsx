import { useState } from "react";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import StatusMessage from "../../components/ui/StatusMessage";
import SelectorHorarios from "../../components/features/SelectorHorarios";
import { crearReserva } from "../../services/api";
import { hoyISO, formatoFecha } from "../../utils/fechas";

export default function VerDisponibilidad({ cancha, onClose }) {
  const [fecha, setFecha] = useState(hoyISO());
  const [seleccion, setSeleccion] = useState(null);
  const [version, setVersion] = useState(0);
  const [reservando, setReservando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  const cambiarFecha = (nueva) => {
    setFecha(nueva);
    setSeleccion(null);
    setError("");
    setExito("");
  };

  const handleReservar = async () => {
    if (!seleccion) return;
    setReservando(true);
    setError("");
    setExito("");
    try {
      await crearReserva({
        idCancha: cancha.idCancha,
        fecha,
        horaInicio: seleccion.horaInicio,
        horaFin: seleccion.horaFin,
      });
      setExito(
        `Reserva creada para el ${formatoFecha(fecha)} de ${seleccion.horaInicio} a ${seleccion.horaFin}. ` +
        "Queda pendiente hasta que el complejo la confirme. Puedes verla en \"Mis reservas\"."
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSeleccion(null);
      setVersion((n) => n + 1); // refresca: el bloque reservado (o el que ganó otro usuario) desaparece
      setReservando(false);
    }
  };

  return (
    <Modal title={`Disponibilidad - ${cancha.nombre}`} onClose={onClose} busy={reservando}>
      <SelectorHorarios
        idCancha={cancha.idCancha}
        fecha={fecha}
        onFechaChange={cambiarFecha}
        seleccion={seleccion}
        onSeleccion={setSeleccion}
        version={version}
      />

      <StatusMessage message={error} />
      <StatusMessage message={exito} type="exito" />

      <div className="sportify-dialog-actions">
        <Button variant="secondary" onClick={onClose} disabled={reservando}>Cerrar</Button>
        <Button onClick={handleReservar} disabled={!seleccion} loading={reservando} loadingLabel="Reservando...">
          {seleccion ? `Reservar ${seleccion.horaInicio} - ${seleccion.horaFin}` : "Reservar"}
        </Button>
      </div>
    </Modal>
  );
}