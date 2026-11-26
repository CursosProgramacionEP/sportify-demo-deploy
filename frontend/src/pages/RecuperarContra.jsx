import { useState } from "react";
import { recuperarContra } from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import FormIcon from "../components/ui/FormIcon";
import StatusMessage from "../components/ui/StatusMessage";

const datosIniciales = { correo: "" };

function RecuperarContra() {
  const [formulario, setFormulario] = useState(datosIniciales);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setFormulario({
      ...formulario,
      [name]: value,
    });
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    if (enviando) return;

    setMensaje("");
    setTipoMensaje("");

    const correo = formulario.correo.trim();

    if (!correo) {
      setMensaje("Ingresa tu correo electrónico.");
      setTipoMensaje("error");
      return;
    }

    try {
      setEnviando(true);

      await recuperarContra(correo);

      setMensaje("Te enviamos un enlace para recuperar tu contraseña.");
      setTipoMensaje("exito");
      setFormulario(datosIniciales);

    } catch (error) {
      setMensaje(error.message);
      setTipoMensaje("error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      title="Recuperar Contraseña"
    >
      <form onSubmit={manejarEnvio} aria-busy={enviando}>
        <FormField
          label="Ingresa tu correo electrónico"
          icon={<FormIcon name="email" />}
          id="correo"
          name="correo"
          autoComplete="email"
          disabled={enviando}
          type="email"
          value={formulario.correo}
          onChange={manejarCambio}
          placeholder="tucorreo@gmail.com"
          required
        />

        <Button
          className="enviar-login"
          type="submit"
          loading={enviando}
          loadingLabel="Enviando..."
          endIcon={<FormIcon name="arrow" />}
        >
          Recuperar Contraseña
        </Button>

        <StatusMessage message={mensaje} type={tipoMensaje} />
      </form>
    </AuthLayout>
  );
}

export default RecuperarContra;
