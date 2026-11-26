    import { useState } from "react";
    import FormModal from "../ui/FormModal";

    export default function EditarUsuarioModal({ usuario, onClose, onSubmit }) {
    const [form, setForm] = useState({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        telefono: usuario.telefono || "",
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
        
        setError("");
        try {
        setEnviando(true);
        const datosLimpios = Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value.trim()])
        );
        await onSubmit?.(usuario.idUsuario, datosLimpios);
        onClose();
        } catch (err) {
        setError(err?.message ?? "Ocurrió un error al guardar.");
        } finally {
        setEnviando(false);
        }
    };

    return (
        <FormModal
        title="Editar Usuario"
        submitLabel="Guardar cambios"
        busy={enviando}
        error={error}
        onClose={onClose}
        onSubmit={handleSubmit}
        >
        <div className="dash-modal-row">
            <div className="dash-modal-field">
            <label className="dash-modal-label">Nombres</label>
            <input 
                name="nombres" 
                value={form.nombres} 
                onChange={handleChange} 
                disabled={enviando} 
                required 
            />
            </div>
            <div className="dash-modal-field">
            <label className="dash-modal-label">Apellidos</label>
            <input 
                name="apellidos" 
                value={form.apellidos} 
                onChange={handleChange} 
                disabled={enviando} 
                required 
            />
            </div>
        </div>

        <div className="dash-modal-row">
            <div className="dash-modal-field">
            <label className="dash-modal-label">Correo electrónico</label>
            <input 
                name="correo" 
                type="email" 
                value={form.correo} 
                onChange={handleChange} 
                disabled={enviando} 
                required 
            />
            </div>
            <div className="dash-modal-field">
            <label className="dash-modal-label">Teléfono</label>
            <input 
                name="telefono" 
                type="tel" 
                value={form.telefono} 
                onChange={handleChange} 
                disabled={enviando} 
                pattern="[0-9]{9}"
                title="Ingresa 9 dígitos"
                maxLength={9}
            />
            </div>
        </div>
        </FormModal>
    );
    }