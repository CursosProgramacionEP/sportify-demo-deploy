import { Link, useOutletContext } from "react-router-dom";
import AuthLayout from "../../../layouts/AuthLayout";
import LogoutButton from "./LogoutButton";
import { RolesList } from "../../../components/ui/RoleBadge";

export default function MiCuenta() {
  const { usuario } = useOutletContext();
  return (
    <AuthLayout title="Mi cuenta" footer={<Link to="/">Volver a la portada</Link>}>
      <p>Hola, {usuario.nombres} {usuario.apellidos}.</p>
      <p>{usuario.correo}</p>
      <p>Roles:</p>
      <RolesList roles={usuario.roles} />
      
      <p><Link to="/dashboard">Ir al panel</Link></p>
      
      <p><Link to="/canchas">Buscar canchas</Link></p>
      <LogoutButton />
    </AuthLayout>
  );
}