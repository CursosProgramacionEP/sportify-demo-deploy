import PageHeader from "../../components/ui/PageHeader";

export default function Reportes() {
    return (
        <div>
        <PageHeader
            title="Reportes"
            description="Módulo en construcción. Próximamente podrás ver estadísticas de reservas e ingresos."
            badge="ADMINISTRADOR DE COMPLEJO"
        />
        <section className="dash-admins-card" style={{ padding: "40px", marginTop: "24px", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-muted)" }}>
            Esta sección se encuentra en desaroollo.
            </p>
        </section>
        </div>
    );
}