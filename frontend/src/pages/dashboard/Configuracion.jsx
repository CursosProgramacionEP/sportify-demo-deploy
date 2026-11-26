import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { editarUsuario } from "../../services/api";
import { primaryRoleHeader } from "../../utils/roles";
import PageHeader from "../../components/ui/PageHeader";
import StatusMessage from "../../components/ui/StatusMessage";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { RoleChipTone } from "../../components/ui/RoleBadge";
import "./Configuracion.css";

/* ---------- Iconos ---------- */
function UserIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 16 0v1" /></svg>; }
function MailIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 6 9 6 9-6" /></svg>; }
function PhoneIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16v3a2 2 0 0 1-2.2 2A18 18 0 0 1 3 5.2 2 2 0 0 1 5 3h3l1 5-2 2a14 14 0 0 0 7 7l2-2Z" /></svg>; }
function LockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V6a4 4 0 0 1 8 0v4" /></svg>; }

export default function Configuracion() {
    const { usuario } = useOutletContext();
    const navigate = useNavigate();

    const originalData = {
        nombres: usuario.nombres || "",
        apellidos: usuario.apellidos || "",
        correo: usuario.correo || "",
        telefono: usuario.telefono || "",
    };

    const [form, setForm] = useState(originalData);
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingPath, setPendingPath] = useState(null);

    const isDirty =
        form.nombres !== originalData.nombres ||
        form.apellidos !== originalData.apellidos ||
        form.correo !== originalData.correo ||
        form.telefono !== originalData.telefono;

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        const handleClick = (e) => {
            const link = e.target.closest("a");
            if (isDirty && link && link.getAttribute("href") && !link.getAttribute("href").startsWith("#")) {
                const href = link.getAttribute("href");
                if (href !== window.location.pathname) {
                    e.preventDefault();
                    e.stopPropagation();
                    setPendingPath(href);
                    setShowConfirm(true);
                }
            }
        };
        document.addEventListener("click", handleClick, { capture: true });
        return () => document.removeEventListener("click", handleClick, { capture: true });
    }, [isDirty]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setMensaje("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (guardando || !isDirty) return;

        setGuardando(true);
        setMensaje("");
        setError("");

        try {
            await editarUsuario(usuario.idUsuario, {
                ...form,
                nombres: form.nombres.trim(),
                apellidos: form.apellidos.trim(),
                correo: form.correo.trim(),
                telefono: form.telefono.trim(),
            });

            setMensaje("Tus datos se han actualizado correctamente.");
            window.dispatchEvent(new Event("sportify:revisar-sesion"));

        } catch (err) {
            setError(err.message || "Error al actualizar el perfil.");
        } finally {
            setGuardando(false);
        }
    };

    const iniciales = `${usuario.nombres?.[0] || ""}${usuario.apellidos?.[0] || ""}`.toUpperCase();

    return (
        <div className="config-page">
            <PageHeader
                title="Mi Perfil"
                description="Administra tu información personal, seguridad y preferencias en la plataforma."
                badge={primaryRoleHeader(usuario.roles)}
            />

            <div className="config-grid">
                <aside className="config-profile-card">
                    <div className="config-avatar-wrapper">
                        <span className="config-avatar">{iniciales}</span>
                    </div>
                    <h2 className="config-name">{usuario.nombres} {usuario.apellidos}</h2>
                    <p className="config-email">{usuario.correo}</p>
                    <div className="config-badges">
                        {usuario.roles?.map((r) => <RoleChipTone key={r} role={r} />)}
                    </div>
                    <div className="config-profile-footer">
                        <p>Cuenta creada y verificada.</p>
                        <span className="config-status-dot">Activo</span>
                    </div>
                </aside>

                <section className="config-main-panel">
                    <div className="config-section">
                        <div className="config-section-header">
                            <h3>Información Personal</h3>
                            <p>Actualiza tus datos básicos de contacto.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="config-form">
                            <div className="config-row">
                                <div className="config-field">
                                    <label>Nombres</label>
                                    <div className="config-input-wrapper">
                                        <span className="config-icon"><UserIcon /></span>
                                        <input name="nombres" value={form.nombres} onChange={handleChange} disabled={guardando} required />
                                    </div>
                                </div>
                                <div className="config-field">
                                    <label>Apellidos</label>
                                    <div className="config-input-wrapper">
                                        <span className="config-icon"><UserIcon /></span>
                                        <input name="apellidos" value={form.apellidos} onChange={handleChange} disabled={guardando} required />
                                    </div>
                                </div>
                            </div>

                            <div className="config-row">
                                <div className="config-field">
                                    <label>Correo Electrónico</label>
                                    <div className="config-input-wrapper">
                                        <span className="config-icon"><MailIcon /></span>
                                        <input name="correo" type="email" value={form.correo} onChange={handleChange} disabled={guardando} required />
                                    </div>
                                </div>
                                <div className="config-field">
                                    <label>Teléfono</label>
                                    <div className="config-input-wrapper">
                                        <span className="config-icon"><PhoneIcon /></span>
                                        <input name="telefono" type="tel" value={form.telefono} onChange={handleChange} disabled={guardando} pattern="([0-9]{9})?" maxLength={9} />
                                    </div>
                                </div>
                            </div>

                            {mensaje && <StatusMessage message={mensaje} type="exito" />}
                            {error && <StatusMessage message={error} type="error" />}

                            <div className="config-actions">
                                <Button
                                    type="submit"
                                    loading={guardando}
                                    loadingLabel="Guardando cambios..."
                                    disabled={!isDirty}
                                >
                                    Guardar Cambios
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="config-divider" />

                    <div className="config-section">
                        <div className="config-section-header">
                            <h3>Seguridad</h3>
                            <p>Administra la contraseña de tu cuenta.</p>
                        </div>
                        <div className="config-field">
                            <label>Contraseña actual</label>
                            <div className="config-input-wrapper">
                                <span className="config-icon"><LockIcon /></span>
                                <input type="password" value="********" disabled />
                            </div>
                        </div>
                        <div className="config-actions">
                            <Button variant="secondary" disabled title="Función próximamente disponible">
                                Cambiar Contraseña
                            </Button>
                        </div>
                    </div>
                </section>
            </div>

            <ConfirmDialog
                isOpen={showConfirm}
                title="¿Salir sin guardar?"
                message="Tienes cambios sin guardar en tu perfil. Si sales ahora, perderás estos cambios."
                confirmText="Salir de todos modos"
                cancelText="Quedarme"
                onConfirm={() => {
                    setShowConfirm(false);
                    if (pendingPath) navigate(pendingPath);
                }}
                onCancel={() => {
                    setShowConfirm(false);
                    setPendingPath(null);
                }}
                danger={true}
            />
        </div>
    );
}