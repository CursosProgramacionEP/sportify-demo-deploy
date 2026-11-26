    import { useState } from "react";
    import FormModal from "../ui/FormModal";

    export default function EditarAdministradorModal({ admin, onClose, onSubmit }) {
    const [estado, setEstado] = useState(admin.estado || "ACTIVO");
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;
        setError("");
        try {
        setEnviando(true);
        await onSubmit?.(admin.idComplejo, admin.idUsuario, estado);
        onClose();
        } catch (err) {
        setError(err?.message ?? "Ocurrió un error al guardar.");
        } finally {
        setEnviando(false);
        }
    };

    return (
        <FormModal
        title="Editar Administrador"
        subtitle={`Configuración para ${admin.nombre}`}
        submitLabel="Guardar cambios"
        busy={enviando}
        error={error}
        onClose={onClose}
        onSubmit={handleSubmit}
        >
        <div className="dash-modal-field">
            <label className="dash-modal-label">Estado en este complejo</label>
            <select
            className="dash-modal-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            disabled={enviando}
            >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
            </select>
        </div>
        </FormModal>
    );
    }