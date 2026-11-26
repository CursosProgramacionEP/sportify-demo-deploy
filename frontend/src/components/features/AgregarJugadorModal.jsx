import { useState } from "react";
import FormModal from "../ui/FormModal";
import { buscarJugador } from "../../services/api";

export default function AgregarJugadorModal({ onClose, onSubmit }) {
    const [correo, setCorreo] = useState("");
    const [buscando, setBuscando] = useState(false);
    const [encontrado, setEncontrado] = useState(null);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const handleBuscar = async (e) => {
        e?.preventDefault();
        const valor = correo.trim();
        if (!valor) {
            setError("Ingresa un correo.");
            return;
        }

        setBuscando(true);
        setError("");
        setEncontrado(null);
        try {
            const datos = await buscarJugador(valor);
            setEncontrado(datos);
        } catch (err) {
            setError(err?.message ?? "No se encontró el jugador.");
        } finally {
            setBuscando(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!encontrado) {
            handleBuscar(e);
            return;
        }
        if (enviando) return;

        setEnviando(true);
        setError("");
        try {
            await onSubmit?.(encontrado.idUsuario);
            onClose();
        } catch (err) {
            setError(err?.message ?? "Ocurrió un error al agregar.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormModal
            title="Agregar jugador"
            subtitle="Busca al jugador por su correo electrónico."
            submitLabel={encontrado ? "Agregar al equipo" : "Buscar"}
            busy={buscando || enviando}
            error={error}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div className="dash-modal-field">
                <label htmlFor="jugador-correo" className="dash-modal-label">
                    Correo del jugador <span className="dash-modal-required">*</span>
                </label>
                <input
                    id="jugador-correo"
                    type="email"
                    value={correo}
                    onChange={(e) => { setCorreo(e.target.value); setEncontrado(null); setError(""); }}
                    placeholder="jugador@correo.com"
                    disabled={buscando || enviando}
                    autoFocus
                    required
                />
            </div>

            {encontrado && (
                <div className="dash-modal-role-box" style={{ marginTop: 0 }}>
                    <div className="dash-modal-role-header">
                        <div className="dash-modal-role-title">
                            <span className="dash-modal-role-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 16 0v1" /></svg>
                            </span>
                            <span>{encontrado.nombres} {encontrado.apellidos}</span>
                        </div>
                        <span className="dash-modal-role-check" aria-hidden="true">
                            <svg viewBox="0 0 24 24"><path d="m5 12 5 5L20 7" /></svg>
                        </span>
                    </div>
                    <div className="dash-modal-role-desc">
                        <p>{encontrado.correo}</p>
                    </div>
                </div>
            )}
        </FormModal>
    );
}