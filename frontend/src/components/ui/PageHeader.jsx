    /**
     * Encabezado superior compartido por las páginas del dashboard.
     * @param {object} props
     * @param {string} props.title Título principal
     * @param {string} props.description Texto descriptivo debajo del título
     * @param {string} [props.badge="ADMINISTRADOR DE SPORTIFY"] Etiqueta de rol
     */
    export default function PageHeader({ title, description, badge = "ADMINISTRADOR DE SPORTIFY" }) {
    return (
        <section className="dash-welcome">
        <div className="dash-welcome-container">
            <div className="dash-welcome-title-row">
            <h1 className="dash-welcome-title">{title}</h1>
            {badge && (
                <span className="dash-welcome-badge">
                <span className="dash-welcome-badge-dot" aria-hidden="true" />
                {badge}
                </span>
            )}
            </div>
            <p className="dash-welcome-description">{description}</p>
        </div>
        </section>
    );
    }