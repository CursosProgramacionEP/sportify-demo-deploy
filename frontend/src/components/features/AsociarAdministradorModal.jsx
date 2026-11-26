    import { useState } from "react";
    import FormModal from "../ui/FormModal";
    import "./AsociarAdministradorModal.css";

    function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
        </svg>
    );
    }

    function CloseIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    );
    }

    function ChevronDownIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
        </svg>
    );
    }

    function ShieldIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
        <path d="m9 12 2 2 4-4" />
        </svg>
    );
    }

    export default function AsociarAdministradorModal({
    complejos = [],
    usuarios = [],
    complejoInicial,
    onClose,
    onSubmit,
    }) {
    const [complejoId, setComplejoId] = useState(
        complejoInicial?.idComplejo ?? complejos[0]?.idComplejo ?? null,
    );
    const [busqueda, setBusqueda] = useState("");
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [listaAbierta, setListaAbierta] = useState(false);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    const nombreUsuario = (u) => `${u.nombres} ${u.apellidos}`.trim();

    const usuariosFiltrados = usuarios.filter((u) => {
        if (!busqueda.trim()) return true;
        const q = busqueda.toLowerCase();
        return (
        nombreUsuario(u).toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q)
        );
    });

    const handleSelectUsuario = (u) => {
        setUsuarioSeleccionado(u);
        setBusqueda("");
        setListaAbierta(false);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (enviando) return;
        if (!complejoId) {
        setError("Selecciona un complejo.");
        return;
        }
        if (!usuarioSeleccionado) {
        setError("Selecciona un usuario para asociar.");
        return;
        }
        setError("");
        try {
        setEnviando(true);
        await onSubmit?.({
            complejoId,
            idUsuario: usuarioSeleccionado.idUsuario,
        });
        onClose();
        } catch (err) {
        setError(err?.message ?? "Ocurrió un error al asociar.");
        } finally {
        setEnviando(false);
        }
    };

    return (
        <FormModal
        title="Asociar administrador"
        submitLabel="Confirmar"
        busy={enviando}
        error={error}
        onClose={onClose}
        onSubmit={handleSubmit}
        >
        {/* Select de complejo */}
        <div className="dash-modal-field">
            <label htmlFor="modal-complejo" className="dash-modal-label">
            Complejo deportivo <span className="dash-modal-required">*</span>
            </label>
            <div className="dash-modal-select-wrap">
            <select
                id="modal-complejo"
                className="dash-modal-select"
                value={complejoId ?? ""}
                onChange={(e) => setComplejoId(Number(e.target.value))}
                disabled={enviando}
            >
                {complejos.map((c) => (
                <option key={c.idComplejo} value={c.idComplejo}>
                    {c.nombre} ({c.direccion})
                </option>
                ))}
            </select>
            <span className="dash-modal-select-arrow" aria-hidden="true">
                <ChevronDownIcon />
            </span>
            </div>
        </div>

        {/* Combobox de usuario */}
        <div className="dash-modal-field">
            <label htmlFor="modal-usuario" className="dash-modal-label">
            Buscar usuario <span className="dash-modal-required">*</span>
            </label>
            <div className="dash-modal-combo">
            {usuarioSeleccionado ? (
                <div className="dash-modal-combo-selected">
                <div className="dash-modal-combo-avatar">
                    {nombreUsuario(usuarioSeleccionado)
                    .split(" ")
                    .slice(0, 2)
                    .map((p) => p[0].toUpperCase())
                    .join("")}
                </div>
                <div className="dash-modal-combo-selected-text">
                    <span className="dash-modal-combo-selected-name">
                    {nombreUsuario(usuarioSeleccionado)}
                    </span>
                    <span className="dash-modal-combo-selected-email">
                    {usuarioSeleccionado.correo}
                    </span>
                </div>
                <button
                    type="button"
                    className="dash-modal-combo-clear"
                    aria-label="Limpiar usuario"
                    onClick={() => setUsuarioSeleccionado(null)}
                >
                    <CloseIcon />
                </button>
                </div>
            ) : (
                <>
                <span className="dash-modal-combo-icon" aria-hidden="true">
                    <SearchIcon />
                </span>
                <input
                    id="modal-usuario"
                    type="text"
                    className="dash-modal-combo-input"
                    placeholder="Buscar por nombre o correo..."
                    value={busqueda}
                    onChange={(e) => {
                    setBusqueda(e.target.value);
                    setListaAbierta(true);
                    }}
                    onFocus={() => setListaAbierta(true)}
                    onBlur={() => setTimeout(() => setListaAbierta(false), 150)}
                    disabled={enviando}
                    autoComplete="off"
                />
                </>
            )}

            {listaAbierta && !usuarioSeleccionado && (
                <ul className="dash-modal-combo-list" role="listbox">
                {usuariosFiltrados.length === 0 ? (
                    <li className="dash-modal-combo-empty-item">Sin resultados</li>
                ) : (
                    usuariosFiltrados.map((u) => (
                    <li
                        key={u.idUsuario}
                        role="option"
                        className="dash-modal-combo-item"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelectUsuario(u)}
                    >
                        <div className="dash-modal-combo-avatar is-small">
                        {nombreUsuario(u)
                            .split(" ")
                            .slice(0, 2)
                            .map((p) => p[0].toUpperCase())
                            .join("")}
                        </div>
                        <div className="dash-modal-combo-item-text">
                        <span className="dash-modal-combo-item-name">
                            {nombreUsuario(u)}
                        </span>
                        <span className="dash-modal-combo-item-email">
                            {u.correo}
                        </span>
                        </div>
                    </li>
                    ))
                )}
                </ul>
            )}
            </div>
        </div>

        {/* Rol a asignar */}
        <div className="dash-modal-field">
            <span className="dash-modal-label">
            Rol a asignar <span className="dash-modal-required">*</span>
            </span>
            <div className="dash-modal-role-box">
            <div className="dash-modal-role-header">
                <div className="dash-modal-role-title">
                <span className="dash-modal-role-icon" aria-hidden="true">
                    <ShieldIcon />
                </span>
                <span>Administrador de complejo</span>
                </div>
                <span className="dash-modal-role-check" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                    <path d="m5 12 5 5L20 7" />
                </svg>
                </span>
            </div>
            <div className="dash-modal-role-desc">
                <p>
                Permite la gestión autónoma de canchas deportivas, administración
                de calendarios de reservas y reportes de facturación exclusiva de
                esta sede.
                </p>
            </div>
            </div>
        </div>
        </FormModal>
    );
    }
