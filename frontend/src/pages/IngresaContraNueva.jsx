import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import FormIcon from "../components/ui/FormIcon";
import StatusMessage from "../components/ui/StatusMessage";

export default function IngresaContraNueva({ onSubmit }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (enviando) return;

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError("");

    try {
      setEnviando(true);
      await onSubmit?.(password);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      title="Ingresa tu nueva contraseña"
    >
      <form onSubmit={handleSubmit} aria-busy={enviando}>
        <FormField
          label="Ingresa tu nueva contraseña"
          icon={<FormIcon name="lock" />}
          id="contrasena"
          name="contrasena"
          autoComplete="new-password"
          disabled={enviando}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <FormField
          label="Confirma tu nueva contraseña"
          icon={<FormIcon name="lock" />}
          id="confirmarContrasena"
          name="confirmarContrasena"
          autoComplete="new-password"
          disabled={enviando}
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />

        <Button
          className="enviar-login"
          type="submit"
          loading={enviando}
          loadingLabel="Guardando..."
          endIcon={<FormIcon name="arrow" />}
        >
          Guardar nueva contraseña
        </Button>

        <StatusMessage message={error} />
      </form>
    </AuthLayout>
  );
}
