import { Link } from "react-router-dom";
import "./Brand.css";

/**
 * Marca tipográfica compartida por las áreas de la aplicación.
 * @param {object} props Variante de tamaño, destino opcional y clases adicionales.
 * @returns {import('react').ReactElement} Marca Sportify con estilo común.
 * @author Equipo Sportify
 */
export default function Brand({ to, variant = "dashboard", className = "" }) {
  const classes = ["brand-sportify", `brand-sportify--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return to ? (
    <Link to={to} className={classes}>Sportify</Link>
  ) : (
    <span className={classes}>Sportify</span>
  );
}