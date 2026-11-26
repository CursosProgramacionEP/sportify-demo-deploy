import { useId, useState } from "react";
import StatusMessage from "./StatusMessage";
import FormIcon from "./FormIcon";
import "./FormField.css";

/**
 * Asocia una etiqueta y un mensaje de validación con una entrada nativa.
 * Conserva atributos como required, pattern, autoComplete y eventos del formulario.
 * Si el campo es de contraseña, agrega un botón para mostrarla u ocultarla.
 * @param {object} props Etiqueta, icono opcional, error y atributos de la entrada.
 * @returns {import('react').ReactElement} Campo con identificador único y descripción accesible.
 * @author Equipo Sportify
 */
export default function FormField({
  label,
  icon,
  error,
  id,
  className = "",
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
  ...inputProps
}) {
  const [verContrasena, setVerContrasena] = useState(false);
  const esContrasena = inputProps.type === "password";
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={["campo", className].filter(Boolean).join(" ")}>
      <label htmlFor={inputId}>{label}</label>
      <div className={[icon ? "entrada-login" : "entrada-sin-icono", esContrasena && "entrada-contrasena"].filter(Boolean).join(" ")}>
        {icon}
        <input
          {...inputProps}
          type={esContrasena && verContrasena ? "text" : inputProps.type}
          id={inputId}
          aria-invalid={error ? true : invalid}
          aria-describedby={[describedBy, error && errorId].filter(Boolean).join(" ") || undefined}
        />
        {esContrasena && (
          <button
            type="button"
            className="boton-ver-contrasena"
            onClick={() => setVerContrasena((v) => !v)}
            aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={verContrasena}
            disabled={inputProps.disabled}
          >
            <FormIcon name={verContrasena ? "eyeOff" : "eye"} />
          </button>
        )}
      </div>
      <StatusMessage id={errorId} message={error} />
    </div>
  );
}