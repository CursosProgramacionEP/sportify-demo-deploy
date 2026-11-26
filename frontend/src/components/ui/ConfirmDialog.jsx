    /*Este componente servirá para Quitar administradores, Desactivar complejos y Cerrar Sesión */
    import Modal from "./Modal";
    import Button from "./Button";

    export default function ConfirmDialog({
    isOpen,
    title = "Confirmar acción",
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    busy = false,
    danger = true, // Si es true, el botón de confirmar se pinta rojo (para acciones destructivas)
    }) {
    if (!isOpen) return null;

    return (
        <Modal title={title} onClose={onCancel} busy={busy}>
        <p className="dash-modal-subtitle" style={{ marginBottom: "24px" }}>
            {message}
        </p>
        <div className="sportify-dialog-actions">
            <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelText}
            </Button>
            <Button
            onClick={onConfirm}
            loading={busy}
            loadingLabel="Procesando..."
            className={danger ? "btn-danger" : ""}
            style={danger ? { backgroundColor: "var(--color-danger)", color: "var(--color-on-danger)", borderColor: "var(--color-danger)" } : {}}
            >
            {confirmText}
            </Button>
        </div>
        </Modal>
    );
    }
