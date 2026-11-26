import "./CanchaCard.css";

function LocationIcon() {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></svg>;
    }
    function ClockIcon() {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    }

    export default function CanchaCard({ cancha, onVerDetalles, onReservar }) {
    return (
        <article className="cancha-card">
        {/* Imagen y Badges */}
        <div className="cancha-card-image-wrapper">
            <img src={cancha.imagen} alt={cancha.nombre} className="cancha-card-image" />
            <span className="badge-distancia">{cancha.distancia} km</span>
            <span className="badge-deporte">{cancha.deporte}</span>
            {cancha.promo && <span className="badge-promo">- {cancha.promo} PROMO</span>}
        </div>

        {/* Contenido */}
        <div className="cancha-card-content">
            <div className="cancha-card-header">
            <h3>{cancha.nombre}</h3>
            {cancha.promoActiva && <span className="promo-activa">Promo Activa</span>}
            </div>
            <p className="cancha-card-club">{cancha.club}</p>
            
            <p className="cancha-card-location">
            <LocationIcon /> {cancha.direccion}
            </p>

            <div className="cancha-card-rating-price">
            
            <div className="cancha-card-prices">
                {cancha.precioAnterior && <span className="precio-tachado">S/ {cancha.precioAnterior}</span>}
                <span className="precio-actual">S/ {cancha.precio} <small>/ hora</small></span>
            </div>
            </div>

            {/* Etiquetas */}
            <div className="cancha-card-tags">
            {cancha.etiquetas.map((tag, idx) => (
                <span key={idx} className="tag">{tag}</span>
            ))}
            </div>

            {/* Horarios */}
            <div className="cancha-card-schedules">
            <p><ClockIcon /> Horarios disponibles:</p>
            <div className="schedule-badges">
                {cancha.horarios.map((hora, idx) => (
                <span key={idx} className="schedule-badge">{hora}</span>
                ))}
            </div>
            </div>

            {/* Botones */}
            <div className="cancha-card-actions">
            <button type="button" className="btn-detalles" onClick={() => onVerDetalles(cancha)}>
                Ver detalles
            </button>
            <button type="button" className="btn-reservar" onClick={() => onReservar(cancha)}>
                Reservar ahora
            </button>
            </div>
        </div>
        </article>
    );
}