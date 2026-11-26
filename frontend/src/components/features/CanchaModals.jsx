import FormModal from "../ui/FormModal";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

export function FormCanchaModal({ cancha, onClose, onSubmit, enviando, error, form, setForm }) {
    const esEdicion = Boolean(cancha);

    return (
        <FormModal
        title={esEdicion ? "Editar Cancha" : "Nueva Cancha"}
        subtitle={esEdicion ? "Modifica los datos de la cancha." : "Ingresa los datos para registrar una nueva cancha."}
        submitLabel={esEdicion ? "Guardar Cambios" : "Crear Cancha"}
        busy={enviando}
        error={error}
        onClose={onClose}
        onSubmit={onSubmit}
        >
        <div className="dash-modal-field">
            <label className="dash-modal-label">Nombre de la cancha</label>
            <input 
            type="text" 
            value={form.nombre} 
            onChange={(e) => setForm({...form, nombre: e.target.value})} 
            required 
            disabled={enviando}
            placeholder="Ej. Cancha Principal 1"
            />
        </div>
        
        {esEdicion ? (
            <div className="dash-modal-row">
            <div className="dash-modal-field">
                <label className="dash-modal-label">Precio por Hora (S/)</label>
                <input 
                type="number" 
                step="0.01" 
                min="0"
                value={form.precioHora} 
                onChange={(e) => setForm({...form, precioHora: e.target.value})} 
                required 
                disabled={enviando}
                placeholder="Ej. 80.00"
                />
            </div>
            <div className="dash-modal-field">
                <label className="dash-modal-label">Estado</label>
                <select 
                className="dash-modal-select"
                value={form.estado} 
                onChange={(e) => setForm({...form, estado: e.target.value})} 
                disabled={enviando}
                >
                <option value="ACTIVA">Activa</option>
                <option value="INACTIVA">Inactiva</option>
                </select>
            </div>
            </div>
        ) : (
            <div className="dash-modal-field">
            <label className="dash-modal-label">Precio por Hora (S/)</label>
            <input 
                type="number" 
                step="0.01" 
                min="0"
                value={form.precioHora} 
                onChange={(e) => setForm({...form, precioHora: e.target.value})} 
                required 
                disabled={enviando}
                placeholder="Ej. 80.00"
            />
            </div>
        )}
        <div className="dash-modal-field">
            <label className="dash-modal-label">Capacidad (jugadores)</label>
            <input
            type="number"
            step="1"
            min="1"
            value={form.capacidad ?? ""}
            onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
            required
            disabled={enviando}
            placeholder="Ej. 10"
            />
        </div>
        </FormModal>
    );
    }

    export function DetalleCanchaModal({ cancha, onClose }) {
    if (!cancha) return null;

    return (
        <Modal title="Detalles de la Cancha" onClose={onClose}>
        <div style={{ display: "grid", gap: "16px", padding: "10px 0" }}>
            <div>
            <span className="dash-modal-label" style={{ display: "block", marginBottom: "4px" }}>Nombre</span>
            <strong style={{ fontSize: "16px", color: "var(--color-text)" }}>{cancha.nombre}</strong>
            </div>
            <div className="dash-modal-row">
            <div>
                <span className="dash-modal-label" style={{ display: "block", marginBottom: "4px" }}>Precio por hora</span>
                <span style={{ color: "var(--color-primary)", fontSize: "16px", fontWeight: "bold" }}>S/ {Number(cancha.precioHora).toFixed(2)}</span>
            </div>
            <div>
                <span className="dash-modal-label" style={{ display: "block", marginBottom: "4px" }}>Estado actual</span>
                <span className={`usuarios-status ${cancha.estado === "ACTIVA" ? "is-active" : ""}`}>
                {cancha.estado === "ACTIVA" ? "Activa" : "Inactiva"}
                </span>
            </div>
            </div>
        </div>
        <div className="sportify-dialog-actions" style={{ marginTop: "24px" }}>
            <Button onClick={onClose}>Cerrar</Button>
        </div>
        </Modal>
    );
}
