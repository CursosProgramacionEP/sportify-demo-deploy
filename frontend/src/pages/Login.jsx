import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { iniciarSesion } from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import FormIcon from "../components/ui/FormIcon";
import StatusMessage from "../components/ui/StatusMessage";

const datosIniciales = {
  correo: "",
  contrasena: "",
};

function Login() {
  const navigate = useNavigate();
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

    const credenciales = {
      correo: formulario.correo.trim(),
      contrasena: formulario.contrasena,
    };

    if (!credenciales.correo || !credenciales.contrasena) {
      setMensaje("Ingresa tu correo y contraseña.");
      setTipoMensaje("error");
      return;
    }

    try {
      setEnviando(true);

      await iniciarSesion(credenciales);

      setMensaje("Inicio de sesión exitoso.");
      setTipoMensaje("exito");
      setFormulario(datosIniciales);

      navigate("/dashboard", { replace: true });

    } catch (error) {
      setMensaje(error.message);
      setTipoMensaje("error");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AuthLayout
      title="Iniciar Sesión"
      footer={
        <>
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
          <p><Link to="/recuperar">¿Olvidaste tu contraseña?</Link></p>
        </>
      }
    >
      <form onSubmit={manejarEnvio} aria-busy={enviando}>
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
          placeholder="entrenador@sportify.com"
          required
        />

        <FormField
          label="Contraseña"
          icon={<FormIcon name="lock" />}
          id="contrasena"
          name="contrasena"
          autoComplete="current-password"
          disabled={enviando}
          type="password"
          value={formulario.contrasena}
          onChange={manejarCambio}
          placeholder="••••••••"
          required
        />

        <label className="recordar-login" title="Sesión persistente próximamente disponible">
          <input type="checkbox" name="recordar" disabled />
          <span>Mantener sesión iniciada</span>
        </label>

        <Button
          className="enviar-login"
          type="submit"
          loading={enviando}
          loadingLabel="Ingresando..."
          endIcon={<FormIcon name="arrow" />}
        >
          Iniciar Sesión
        </Button>

        <StatusMessage message={mensaje} type={tipoMensaje} />
      </form>
    </AuthLayout>
  );
}

export default Login;