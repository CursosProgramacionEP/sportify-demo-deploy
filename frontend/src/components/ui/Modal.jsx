import { useEffect, useId, useRef } from "react";
import "./Modal.css";

/**
 * Mantiene el foco dentro del diálogo y admite Escape salvo durante un guardado.
 * @param {object} props Título, contenido, cierre y bloqueo durante el envío.
 * @returns {import('react').ReactElement} Diálogo accesible que restaura el foco al cerrarse.
 * @author Equipo Sportify
 */
export default function Modal({ title, children, onClose, busy = false }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="sportify-dialog" aria-labelledby={titleId} aria-busy={busy}
    onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}>
    <div className="dash-modal-gradient" aria-hidden="true" />
    <header className="dash-modal-header">
      <h2 className="dash-modal-title" id={titleId}>{title}</h2>
      <button
        className="dash-modal-close"
        type="button"
        disabled={busy}
        onClick={onClose}
        aria-label="Cerrar diálogo"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
    </header>
    {children}
  </dialog>;
}
