import { useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusMessage from "../../components/ui/StatusMessage";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import ModificarReservaModal from "../../components/features/ModificarReservaModal";
import { listarMisReservas, cancelarReserva } from "../../services/api";
import { formatoFecha, hhmm, yaComenzo } from "../../utils/fechas";
import "./MisReservas.css";

const ESTADO_LABEL = {
  PENDIENTE: "Pendiente",
  CONFIRMADA: "Confirmada",
  CANCELADA: "Cancelada",
};

export default function MisReservas() {
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  const [aModificar, setAModificar] = useState(null);
  const [aCancelar, setACancelar] = useState(null);
  const [cancelando, setCancelando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    listarMisReservas(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setReservas(data);
        setError("");
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
    return () => controller.abort();
  }, [intento]);

  const recargar = () => setIntento((n) => n + 1);

  const handleCancelar = async () => {
    setCancelando(true);
    setErrorAccion("");
    try {
      await cancelarReserva(aCancelar.idReserva);
      setACancelar(null);
      recargar();
    } catch (err) {
      setErrorAccion(err.message);
      setACancelar(null);
    } finally {
      setCancelando(false);
    }
  };

  const columnas = [
    {
      key: "cancha",
      label: "CANCHA",
      width: "1.4fr",
      render: (r) => <span className="dash-admins-nombre">{r.nombreCancha}</span>,
    },
    {
      key: "fecha",
      label: "FECHA",
      width: "0.9fr",
      render: (r) => <span className="dash-admins-texto">{formatoFecha(r.fecha)}</span>,
    },
    {
      key: "horario",
      label: "HORARIO",
      width: "1fr",
      render: (r) => <span className="dash-admins-texto">{hhmm(r.horaInicio)} - {hhmm(r.horaFin)}</span>,
    },
    {
      key: "estado",
      label: "ESTADO",
      width: "0.9fr",
      render: (r) => (
        <span className={`reserva-estado is-${r.estado.toLowerCase()}`}>
          {ESTADO_LABEL[r.estado] ?? r.estado}
        </span>
      ),
    },
    {
      key: "acciones",
      label: "ACCIONES",
      width: "1.2fr",
      render: (r) => {
        const editable = r.estado !== "CANCELADA" && !yaComenzo(r);
        if (!editable) return <span className="dash-admins-texto">—</span>;
        return (
          <div className="reserva-acciones">
            <button type="button" className="reserva-accion" onClick={() => setAModificar(r)}>
              Modificar
            </button>
            <button type="button" className="reserva-accion is-danger" onClick={() => setACancelar(r)}>
              Cancelar
            </button>
          </div>
        );
      },
    },
  ];

  // DataTable usa row.id como key; sin esto usaría idUsuario, que es igual en todas tus filas.
  const filas = reservas.map((r) => ({ ...r, id: r.idReserva }));

  return (
    <>
      <PageHeader
        title="Mis reservas"
        description="Consulta, modifica o cancela tus reservas de canchas."
        badge="CLIENTE"
      />

      {errorAccion && <StatusMessage message={errorAccion} />}

      <section className="dash-admins-card" style={{ padding: 0 }}>
        <DataTable
          columns={columnas}
          data={filas}
          loading={cargando}
          error={error}
          onRetry={() => { setCargando(true); setError(""); recargar(); }}
          emptyMessage="Aún no tienes reservas. Reserva una cancha desde la sección Canchas."
        />
      </section>

      {aModificar && (
        <ModificarReservaModal
          reserva={aModificar}
          onClose={() => setAModificar(null)}
          onGuardado={() => { setAModificar(null); setErrorAccion(""); recargar(); }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(aCancelar)}
        title="Cancelar reserva"
        message={aCancelar
          ? `¿Cancelar tu reserva en ${aCancelar.nombreCancha} del ${formatoFecha(aCancelar.fecha)} a las ${hhmm(aCancelar.horaInicio)}?`
          : ""}
        confirmText="Sí, cancelar"
        cancelText="Volver"
        onConfirm={handleCancelar}
        onCancel={() => setACancelar(null)}
        busy={cancelando}
      />
    </>
  );
}