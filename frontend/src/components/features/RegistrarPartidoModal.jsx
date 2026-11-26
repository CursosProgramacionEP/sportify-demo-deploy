import { useState } from "react";
import FormModal from "../ui/FormModal";

function hoyISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
}

export default function RegistrarPartidoModal({ partido, onClose, onSubmit }) {
    const esEdicion = Boolean(partido);
    const [form, setForm] = useState({
        fecha: partido?.fecha ?? hoyISO(),
        rival: partido?.rival ?? "",
        golesFavor: partido?.golesFavor ?? "",
        golesContra: partido?.golesContra ?? "",
        observaciones: partido?.observaciones ?? "",
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

        if (!form.rival.trim()) {
            setError("El rival no puede estar vacío.");
            return;
        }
        const gf = Number(form.golesFavor);
        const gc = Number(form.golesContra);
        if (!Number.isInteger(gf) || gf < 0 || !Number.isInteger(gc) || gc < 0) {
            setError("Los goles deben ser números enteros mayores o iguales a cero.");
            return;
        }

        setEnviando(true);
        setError("");
        try {
            await onSubmit?.({
                fecha: form.fecha,
                rival: form.rival.trim(),
                golesFavor: gf,
                golesContra: gc,
                observaciones: form.observaciones.trim() || null,
            });
            onClose();
        } catch (err) {
            setError(err?.message ?? "Ocurrió un error al guardar el partido.");
        } finally {
            setEnviando(false);
        }
    };

    return (
        <FormModal
            title={esEdicion ? "Editar partido" : "Registrar partido"}
            subtitle={esEdicion
                ? "Actualiza los datos del partido."
                : "Registra el resultado de un partido jugado."}
            submitLabel={esEdicion ? "Guardar cambios" : "Registrar"}
            busy={enviando}
            error={error}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div className="dash-modal-row">
                <div className="dash-modal-field">
                    <label htmlFor="partido-fecha" className="dash-modal-label">
                        Fecha <span className="dash-modal-required">*</span>
                    </label>
                    <input
                        id="partido-fecha"
                        name="fecha"
                        type="date"
                        value={form.fecha}
                        max={hoyISO()}
                        onChange={handleChange}
                        disabled={enviando}
                        required
                    />
                </div>
                <div className="dash-modal-field">
                    <label htmlFor="partido-rival" className="dash-modal-label">
                        Rival <span className="dash-modal-required">*</span>
                    </label>
                    <input
                        id="partido-rival"
                        name="rival"
                        type="text"
                        value={form.rival}
                        onChange={handleChange}
                        placeholder="Ej. Los Tigres"
                        maxLength={100}
                        disabled={enviando}
                        required
                    />
                </div>
            </div>

            <div className="dash-modal-row">
                <div className="dash-modal-field">
                    <label htmlFor="partido-goles-favor" className="dash-modal-label">
                        Goles a favor <span className="dash-modal-required">*</span>
                    </label>
                    <input
                        id="partido-goles-favor"
                        name="golesFavor"
                        type="number"
                        min="0"
                        step="1"
                        value={form.golesFavor}
                        onChange={handleChange}
                        disabled={enviando}
                        required
                    />
                </div>
                <div className="dash-modal-field">
                    <label htmlFor="partido-goles-contra" className="dash-modal-label">
                        Goles en contra <span className="dash-modal-required">*</span>
                    </label>
                    <input
                        id="partido-goles-contra"
                        name="golesContra"
                        type="number"
                        min="0"
                        step="1"
                        value={form.golesContra}
                        onChange={handleChange}
                        disabled={enviando}
                        required
                    />
                </div>
            </div>

            <div className="dash-modal-field">
                <label htmlFor="partido-obs" className="dash-modal-label">Observaciones</label>
                <input
                    id="partido-obs"
                    name="observaciones"
                    type="text"
                    value={form.observaciones}
                    onChange={handleChange}
                    placeholder="Opcional: notas del partido"
                    maxLength={255}
                    disabled={enviando}
                />
            </div>
        </FormModal>
    );
}