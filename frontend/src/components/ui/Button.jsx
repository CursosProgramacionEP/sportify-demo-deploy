/**
 * Botón nativo con variantes visuales y bloqueo durante operaciones asíncronas.
 * @param {object} props Propiedades del botón, incluidos los atributos HTML nativos.
 * @param {'primary'|'secondary'} [props.variant='primary'] Apariencia compartida.
 * @param {boolean} [props.loading=false] Deshabilita la interacción mientras se procesa.
 * @param {string} [props.loadingLabel] Texto que sustituye al contenido durante la carga.
 * @returns {import('react').ReactElement} Botón accesible; por defecto no envía formularios.
 * @author Equipo Sportify
 */
export default function Button({
  children,
  variant = "primary",
  type = "button",
  loading = false,
  loadingLabel,
  disabled = false,
  endIcon,
  className = "",
  ...props
}) {
  return (
    <button
      {...props}
      type={type}
      className={["btn", variant === "secondary" && "btn-secondary", className].filter(Boolean).join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && loadingLabel ? loadingLabel : children}
      {endIcon}
    </button>
  );
}
