    import { useState } from "react";
    import FormModal from "../ui/FormModal";
    import "./NuevoComplejoModal.css";

    const FORM_INICIAL = {
    nombre: "",
    direccion: "",
    telefono: "",
    estado: "Activo",
    };

    export default function NuevoComplejoModal({ onClose, onSubmit }) {
    const [form, setForm] = useState(FORM_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;

        if (
        !form.nombre.trim() ||
        !form.direccion.trim() ||
        !form.telefono.trim()
        ) {
        setError("Completa todos los campos obligatorios.");
        return;
        }

        setError("");
        try {
        setEnviando(true);
        await onSubmit?.(form);
        onClose();
        } catch (err) {
        setError(err?.message ?? "Ocurrió un error al guardar.");
        } finally {
        setEnviando(false);
        }
    };

    return (
        <FormModal
        title="Registrar Complejo"
        subtitle="Ingresa la información básica para dar de alta la nueva sede deportiva."
        submitLabel="Confirmar"
        busy={enviando}
        error={error}
        onClose={onClose}
        onSubmit={handleSubmit}
        >
        <div className="dash-modal-field">
            <label htmlFor="modal-nombre" className="dash-modal-label">
            Nombre del complejo <span className="dash-modal-required">*</span>
            </label>
            <input
            id="modal-nombre"
            name="nombre"
            type="text"
            placeholder="Ej. Complejo Los Olivos"
            value={form.nombre}
            onChange={handleChange}
            disabled={enviando}
            autoFocus
            required
            />
        </div>

        <div className="dash-modal-field">
            <label htmlFor="modal-direccion" className="dash-modal-label">
            Dirección <span className="dash-modal-required">*</span>
            </label>
            <input
            id="modal-direccion"
            name="direccion"
            type="text"
            placeholder="Ej. Av. Principal 1234, Los Olivos"
            value={form.direccion}
            onChange={handleChange}
            disabled={enviando}
            required
            />
        </div>

        <div className="dash-modal-row">
            <div className="dash-modal-field">
            <label htmlFor="modal-telefono" className="dash-modal-label">
                Teléfono <span className="dash-modal-required">*</span>
            </label>
            <input
                id="modal-telefono"
                name="telefono"
                type="tel"
                placeholder="Ej. 987654321"
                value={form.telefono}
                onChange={handleChange}
                disabled={enviando}
                pattern="[0-9]{9}"
                title="Ingresa 9 dígitos"
                required
            />
            </div>

            <div className="dash-modal-field">
            <span className="dash-modal-label">Estado</span>
            <div
                className="dash-modal-status-group"
                role="radiogroup"
                aria-label="Estado del complejo"
            >
                <button
                type="button"
                role="radio"
                aria-checked={form.estado === "Activo"}
                className={`dash-modal-status-option ${form.estado === "Activo" ? "is-active-green" : ""}`}
                onClick={() => setForm((p) => ({ ...p, estado: "Activo" }))}
                disabled={enviando}
                >
                <span className="dash-modal-status-dot" />
                Activo
                </button>
                <button
                type="button"
                role="radio"
                aria-checked={form.estado === "Inactivo"}
                className={`dash-modal-status-option ${form.estado === "Inactivo" ? "is-active-red" : ""}`}
                onClick={() => setForm((p) => ({ ...p, estado: "Inactivo" }))}
                disabled={enviando}
                >
                <span className="dash-modal-status-dot" />
                Inactivo
                </button>
            </div>
            </div>
        </div>
        </FormModal>
    );
    }
