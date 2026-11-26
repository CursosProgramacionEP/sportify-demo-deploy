import Brand from "../components/ui/Brand";

/**
 * Cabecera de marca compartida por acceso, registro y recuperación.
 * @param {object} props Identificador opcional del título y descripción de la pantalla.
 * @returns {import('react').ReactElement} Marca y descripción con el diseño original.
 * @author Equipo Sportify
 */
export default function AuthHeader({ titleId, description = "Gestión Deportiva de Alto Rendimiento" }) {
  return (
    <header className="marca-login">
      <h1 id={titleId}><Brand variant="auth" /></h1>
      <p>{description}</p>
    </header>
  );
}
