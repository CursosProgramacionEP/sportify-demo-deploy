import { useId } from "react";
import { Link } from "react-router-dom";
import AuthHeader from "./AuthHeader";
import ThemeToggle from "../components/ui/ThemeToggle";
import "../pages/Login.css";
import "../pages/Registro.css";
import "./AuthLayout.css";


/**
 * Comparte fondo, marca y tarjeta sin introducir estado de negocio en el diseño.
 * La variante de registro mantiene la marca dentro de la tarjeta original.
 * @param {object} props Título, descripción, contenido, pie y variante de registro.
 * @returns {import('react').ReactElement} Estructura de una pantalla de autenticación.
 * @author Equipo Sportify
 */
export default function AuthLayout({ children, title, description, footer, registration = false }) {
  const titleId = useId();
  const header = <AuthHeader titleId={registration ? titleId : undefined} description={description} />;
  const content = (
    <>
      {registration ? header : <h2 id={titleId}>{title}</h2>}
      {children}
      {footer && <footer>{footer}</footer>}
    </>
  );

  return (
    <main className={`pagina-login${registration ? " registro" : ""}`}>
      <ThemeToggle className="theme-toggle--auth" />
      <Link to="/" className="volver-inicio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Volver al inicio
      </Link>

      {registration ? (
        <section className="contenedor-login tarjeta-login" aria-labelledby={titleId}>
          {content}
        </section>
      ) : (
        <div className="contenedor-login">
          {header}
          <section className="tarjeta-login" aria-labelledby={titleId}>
            {content}
          </section>
        </div>
      )}
    </main>
  );
}
