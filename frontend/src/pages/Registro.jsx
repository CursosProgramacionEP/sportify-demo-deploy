import { useState } from "react";
import { Link } from "react-router-dom";
import { registrarUsuario } from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import FormIcon from "../components/ui/FormIcon";
import StatusMessage from "../components/ui/StatusMessage";

const datosIniciales = {
  nombres: "",
  apellidos: "",
  telefono: "",
  correo: "",
  contrasena: "",
  confirmarContrasena: "",
};

function Registro() {
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

    if (formulario.contrasena !== formulario.confirmarContrasena) {
      setMensaje("Las contraseñas no coinciden.");
      setTipoMensaje("error");
      return;
    }

    const usuario = {
      nombres: formulario.nombres.trim(),
      apellidos: formulario.apellidos.trim(),
      telefono: formulario.telefono.trim(),
      correo: formulario.correo.trim(),
      contrasena: formulario.contrasena,
    };

    if (!usuario.nombres || !usuario.apellidos) {
      setMensaje("Los nombres y apellidos no pueden contener solo espacios.");
      setTipoMensaje("error");
      return;
    }

    try {
      setEnviando(true);

      await registrarUsuario(usuario);

      setMensaje("Usuario registrado correctamente.");
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
      registration
      description="Crea tu cuenta para empezar a gestionar."
      footer={
        <>
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      <form onSubmit={manejarEnvio} aria-busy={enviando}>
        <FormField
          label="Nombres"
          icon={<FormIcon name="user" />}
          id="nombres"
          name="nombres"
          autoComplete="given-name"
          disabled={enviando}
          type="text"
          value={formulario.nombres}
          onChange={manejarCambio}
          placeholder="Ingresa tus nombres"
          required
        />

        <FormField
          label="Apellidos"
          icon={<FormIcon name="user" />}
          id="apellidos"
          name="apellidos"
          autoComplete="family-name"
          disabled={enviando}
          type="text"
          value={formulario.apellidos}
          onChange={manejarCambio}
          placeholder="Ingresa tus apellidos"
          required
        />

        <FormField
          label="Teléfono"
          icon={<FormIcon name="phone" />}
          id="telefono"
          name="telefono"
          autoComplete="tel"
          disabled={enviando}
          type="tel"
          value={formulario.telefono}
          onChange={manejarCambio}
          placeholder="Ingresa tu teléfono"
          pattern="[0-9]{9}"
          title="El teléfono debe contener 9 números"
          required
        />

        <FormField
          label="Correo electrónico"
          icon={<FormIcon name="email" />}
          id="correo"
          name="correo"
          autoComplete="email"
          disabled={enviando}
          type="email"
          value={formulario.correo}
          onChange={manejarCambio}
          placeholder="nombre@correo.com"
          required
        />

        <FormField
          label="Contraseña"
          icon={<FormIcon name="lock" />}
          id="contrasena"
          name="contrasena"
          autoComplete="new-password"
          disabled={enviando}
          type="password"
          value={formulario.contrasena}
          onChange={manejarCambio}
          placeholder="Mínimo 8 caracteres"
          minLength="8"
          required
        />

        <FormField
          label="Confirmar contraseña"
          icon={<FormIcon name="confirm" />}
          id="confirmarContrasena"
          name="confirmarContrasena"
          autoComplete="new-password"
          disabled={enviando}
          type="password"
          value={formulario.confirmarContrasena}
          onChange={manejarCambio}
          placeholder="Repite tu contraseña"
          minLength="8"
          required
        />

        <Button
          className="enviar-login"
          type="submit"
          loading={enviando}
          loadingLabel="Registrando..."
        >
          Registrarse
        </Button>

        <StatusMessage message={mensaje} type={tipoMensaje} />
      </form>
    </AuthLayout>
  );
}

export default Registro;
