import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cerrarSesion } from "../../../services/api";
import Button from "../Button";
import ConfirmDialog from "../ConfirmDialog";

export default function LogoutButton({ dashboard = false }) {
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  async function salir() {
    if (enviando) return;
    setEnviando(true);
    try {
      await cerrarSesion();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      // Forzamos la salida aunque falle el backend
      navigate("/login", { replace: true });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      {dashboard ? (
        <button className="dash-header-logout" type="button" onClick={() => setMostrarConfirmacion(true)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" /><path d="M21 12H9" />
          </svg>
          <span>Salir</span>
        </button>
      ) : (
        <Button variant="secondary" onClick={() => setMostrarConfirmacion(true)}>
          Salir
        </Button>
      )}

      <ConfirmDialog
        isOpen={mostrarConfirmacion}
        title="Cerrar sesión"
        message="¿Estás seguro que deseas salir del panel de administración?"
        confirmText="Sí, salir"
        cancelText="Cancelar"
        onConfirm={salir}
        onCancel={() => setMostrarConfirmacion(false)}
        busy={enviando}
        danger={false} 
      />
    </>
  );
}