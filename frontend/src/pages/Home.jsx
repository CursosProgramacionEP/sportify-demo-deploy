import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarComplejos, listarCatalogoCanchas } from "../services/api";
import PublicNavbar from "../layouts/PublicNavbar";
import PublicHero from "../layouts/PublicHero";
import ComplejoCard from "../components/features/ComplejoCard";
import CanchaCatalogoCard from "../components/features/CanchaCatalogoCard";
import "./Home.css";
import "./HomeRedesign.css";

function Home() {
  const [complejos, setComplejos] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [estadoComplejos, setEstadoComplejos] = useState("cargando");
  const [estadoCanchas, setEstadoCanchas] = useState("cargando");
  const [paginaActual, setPaginaActual] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    listarComplejos(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setComplejos(data.filter((complejo) => complejo.estado === "ACTIVO"));
          setEstadoComplejos("listo");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError" && !controller.signal.aborted) {
          console.error(error);
          setEstadoComplejos("error");
        }
      });

    listarCatalogoCanchas(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setCanchas(data);
          setEstadoCanchas("listo");
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError" && !controller.signal.aborted) {
          console.warn(error);
          setEstadoCanchas("error");
        }
      });

    return () => controller.abort();
  }, []);

  const siguienteComplejo = () => {
    setPaginaActual((pagina) => (pagina + 1) % complejos.length);
  };

  const anteriorComplejo = () => {
    setPaginaActual((pagina) => (pagina - 1 + complejos.length) % complejos.length);
  };

  const complejosVisibles = complejos.length > 0
    ? complejos.map((_, index) => complejos[(paginaActual + index) % complejos.length]).slice(0, 3)
    : [];

  return (
    <div className="home home-public">
      <PublicNavbar />

      <main className="home-main">
        <PublicHero />

        <section
          className="home-complejos"
          id="complejos"
          tabIndex={-1}
          aria-labelledby="titulo-complejos"
          aria-busy={estadoComplejos === "cargando"}
        >
          <div className="home-seccion-titulo">
            <h2 id="titulo-complejos">Complejos disponibles</h2>
          </div>

          {estadoComplejos === "cargando" ? (
            <p className="estado-carga" role="status">Cargando complejos...</p>
          ) : estadoComplejos === "error" ? (
            <p className="estado-error" role="alert">No se pudieron cargar los complejos. Inténtalo más tarde.</p>
          ) : complejos.length === 0 ? (
            <p className="estado-vacio" role="status">Aún no hay complejos disponibles.</p>
          ) : (
            <div className="home-carrusel" role="region" aria-label="Complejos disponibles">
              {complejos.length > 3 && (
                <button
                  className="home-anterior"
                  type="button"
                  onClick={anteriorComplejo}
                  aria-label="Ver complejos anteriores"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
                </button>
              )}

              <div className="home-complejos-lista">
                {complejosVisibles.map((complejo, index) => (
                  <ComplejoCard key={complejo.idComplejo} complejo={complejo} index={index} />
                ))}
              </div>

              {complejos.length > 3 && (
                <button
                  className="home-siguiente"
                  type="button"
                  onClick={siguienteComplejo}
                  aria-label="Ver siguientes complejos"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
                </button>
              )}
            </div>
          )}
        </section>

        <section
          id="canchas"
          tabIndex={-1}
          aria-labelledby="titulo-canchas"
          aria-busy={estadoCanchas === "cargando"}
        >
          <div className="home-seccion-titulo home-canchas-titulo">
            <h2 id="titulo-canchas">Canchas destacadas</h2>
            <Link className="home-ver-mas" to="/canchas">Ver todas</Link>
          </div>

          {estadoCanchas === "cargando" ? (
            <p className="estado-carga" role="status">Cargando canchas...</p>
          ) : estadoCanchas === "error" ? (
            <p className="estado-error" role="alert">No se pudieron cargar las canchas. Inténtalo más tarde.</p>
          ) : canchas.length === 0 ? (
            <p className="estado-vacio" role="status">No hay canchas disponibles por ahora.</p>
          ) : (
            <div className="home-canchas">
              {canchas.slice(0, 3).map((cancha, index) => (
                <CanchaCatalogoCard key={cancha.idCancha} cancha={cancha} index={index}>
                  <Link to="/login">Reservar ahora</Link>
                </CanchaCatalogoCard>
              ))}
            </div>
          )}
        </section>

        <section className="home-nosotros" id="nosotros" tabIndex={-1} aria-labelledby="titulo-nosotros">
          <div className="home-seccion-titulo home-nosotros-titulo">
            <h2 id="titulo-nosotros">
              Tu próximo partido <span className="text-gradient">empieza aquí</span>
            </h2>
            <p>No solo reservas canchas; organizas a tu equipo, encuentras rivales y vives el deporte sin complicaciones.</p>
          </div>

          <div className="nosotros-grid">
            <article className="nosotros-card">
              <div className="nosotros-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3>Reserva Express</h3>
              <p>Elige tu cancha, la fecha y el horario desde la plataforma.</p>
            </article>

            <article className="nosotros-card">
              <div className="nosotros-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Gestión de Equipos</h3>
              <p>Crea tu equipo, invita a tus amigos y lleva el control del plantel y sus partidos en un solo lugar.</p>
            </article>

            <article className="nosotros-card">
              <div className="nosotros-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3>Complejos deportivos</h3>
              <p>Explora espacios deportivos y consulta la información disponible para elegir dónde jugar.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <Link className="home-footer-marca" to="/">Sportify</Link>
        <div className="home-footer-info">
          <span>Privacidad</span><span>Términos</span><span>Contacto</span><span>Soporte</span>
        </div>
        <p>© 2026 Sportify. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default Home;
