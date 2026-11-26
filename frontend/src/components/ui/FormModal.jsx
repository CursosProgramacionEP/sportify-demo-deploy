    import Modal from "./Modal";
    import Button from "./Button";

    /**
     * Modal con formulario: envuelve <form>, footer Cancelar/Confirmar y mensaje de error.
     * Los campos se pasan como children. El submit lo maneja el consumidor.
     *
     * @param {object} props
     * @param {string} props.title
     * @param {string} [props.subtitle]
     * @param {string} [props.submitLabel="Confirmar"]
     * @param {boolean} [props.busy=false]
     * @param {string} [props.error]
     * @param {() => void} props.onClose
     * @param {(event: React.FormEvent) => void} props.onSubmit
     */
    export default function FormModal({
    title,
    subtitle,
    submitLabel = "Confirmar",
    busy = false,
    error,
    onClose,
    onSubmit,
    children,
    }) {
    return (
        <Modal title={title} onClose={onClose} busy={busy}>
        {subtitle && <p className="dash-modal-subtitle">{subtitle}</p>}
        <form className="dash-modal-form" onSubmit={onSubmit} aria-busy={busy}>
            {children}
            {error && (
            <p role="alert" className="dash-modal-error">
                {error}
            </p>
            )}
            <div className="sportify-dialog-actions">
            <Button variant="secondary" disabled={busy} onClick={onClose}>
                Cancelar
            </Button>
            <Button
                type="submit"
                loading={busy}
                loadingLabel={`${submitLabel}...`}
            >
                {submitLabel}
            </Button>
            </div>
        </form>
        </Modal>
    );
    }
