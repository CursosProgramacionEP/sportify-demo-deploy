import { Link } from "react-router-dom";

export default function PublicHero() {
    return (
        <section className="public-hero" id="inicio" tabIndex={-1} aria-labelledby="titulo-home">
        <div className="public-hero-content">
            <h1 id="titulo-home" className="public-hero-title">
            Encuentra tu cancha ideal <br />
            <span className="text-gradient">y vuelve a jugar</span>
            </h1>
            <p className="public-hero-subtitle">
            Reserva canchas de fútbol en segundos. 
            Organiza a tu equipo y disfruta del deporte sin complicaciones.
            </p>
            <div className="public-hero-cta">
            <a href="#canchas" className="btn-primary">Ver canchas</a>
            <Link to="/registro" className="btn-secondary">Registrarse gratis</Link>
            </div>
        </div>
        </section>
    );
}
