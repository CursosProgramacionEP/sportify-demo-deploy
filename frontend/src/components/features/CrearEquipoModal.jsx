import { useState } from "react";
import FormModal from "../ui/FormModal";

const NIVELES = [
    { value: "PRINCIPIANTE", label: "Principiante" },
    { value: "INTERMEDIO", label: "Intermedio" },
    { value: "AVANZADO", label: "Avanzado" },
];

export default function CrearEquipoModal({ equipo, onClose, onSubmit }) {
    const esEdicion = Boolean(equipo);
    const [form, setForm] = useState({
        nombre: equipo?.nombre ?? "",
        nivel: equipo?.nivel ?? "PRINCIPIANTE",
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

        const nombre = form.nombre.trim();
        if (!nombre) {
            setError("El nombre no puede estar vacío.");
            return;
        }

        setEnviando(true);
        setError("");
        try {
            const payload = esEdicion
                ? { nombre }
                : { nombre, nivel: form.nivel };
            await onSubmit?.(payload);
            onClose();
        } catch (err) {
            setError(err?.message ?? "Ocurrió un error al guardar.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormModal
            title={esEdicion ? "Editar equipo" : "Nuevo equipo"}
            subtitle={esEdicion
                ? "Actualiza el nombre de tu equipo."
                : "Crea un equipo para organizar a tus jugadores y registrar partidos."}
            submitLabel={esEdicion ? "Guardar cambios" : "Crear equipo"}
            busy={enviando}
            error={error}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div className="dash-modal-field">
                <label htmlFor="equipo-nombre" className="dash-modal-label">
                    Nombre del equipo <span className="dash-modal-required">*</span>
                </label>
                <input
                    id="equipo-nombre"
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej. Los Cracks FC"
                    maxLength={100}
                    disabled={enviando}
                    autoFocus
                    required
                />
            </div>

            {!esEdicion && (
                <div className="dash-modal-field">
                    <label htmlFor="equipo-nivel" className="dash-modal-label">
                        Nivel <span className="dash-modal-required">*</span>
                    </label>
                    <select
                        id="equipo-nivel"
                        name="nivel"
                        className="dash-modal-select"
                        value={form.nivel}
                        onChange={handleChange}
                        disabled={enviando}
                    >
                        {NIVELES.map((n) => (
                            <option key={n.value} value={n.value}>{n.label}</option>
                        ))}
                    </select>
                </div>
            )}
        </FormModal>
    );
}