import "./StatusMessage.css";

/**
 * Presenta errores como alertas y confirmaciones como anuncios no urgentes.
 * @param {object} props Mensaje, tipo (error o exito) y atributos HTML adicionales.
 * @returns {import('react').ReactElement|null} Mensaje visible o null cuando no hay contenido.
 * @author Equipo Sportify
 */
export default function StatusMessage({ message, type = "error", className = "", ...props }) {
  if (!message) return null;

  return (
    <p
      {...props}
      className={["mensaje", type, className].filter(Boolean).join(" ")}
      role={type === "error" ? "alert" : "status"}
      aria-atomic="true"
    >
      {message}
    </p>
  );
}
