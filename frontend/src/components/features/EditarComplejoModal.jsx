    import { useState } from "react";
    import FormModal from "../ui/FormModal";

    export default function EditarComplejoModal({ complejo, onClose, onSubmit }) {
    const [form, setForm] = useState({
        nombre: complejo.nombre,
        direccion: complejo.direccion,
        telefono: complejo.telefono || "",
        estado: complejo.estado,
    });
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;
        if (!form.nombre.trim() || !form.direccion.trim()) {
        setError("Nombre y dirección son obligatorios.");
        return;
        }
        setError("");
        try {
        setEnviando(true);
        await onSubmit?.(complejo.idComplejo, form);
        onClose();
        } catch (err) {
        setError(err?.message ?? "Error al guardar.");
        } finally {
        setEnviando(false);
        }
    };

    return (
        <FormModal
        title="Editar Complejo"
        submitLabel="Guardar cambios"
        busy={enviando}
        error={error}
        onClose={onClose}
        onSubmit={handleSubmit}
        >
        <div className="dash-modal-field">
            <label className="dash-modal-label">Nombre del complejo</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} disabled={enviando} required />
        </div>
        <div className="dash-modal-field">
            <label className="dash-modal-label">Dirección</label>
            <input name="direccion" value={form.direccion} onChange={handleChange} disabled={enviando} required />
        </div>
        <div className="dash-modal-row">
            <div className="dash-modal-field">
            <label className="dash-modal-label">Teléfono</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} disabled={enviando} />
            </div>
            <div className="dash-modal-field">
            <label className="dash-modal-label">Estado</label>
            <select name="estado" className="dash-modal-select" value={form.estado} onChange={handleChange} disabled={enviando}>
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
            </select>
            </div>
        </div>
        </FormModal>
    );
    }