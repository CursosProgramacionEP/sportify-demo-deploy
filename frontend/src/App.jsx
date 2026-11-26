import { Routes, Route, useOutletContext, Link } from "react-router-dom";
import Registro from "./pages/Registro";
import Login from "./pages/Login";
import Home from "./pages/Home";
import RecuperarContra from "./pages/RecuperarContra";
import IngresaContraNueva from "./pages/IngresaContraNueva";
import DashboardLayout from "./layouts/DashboardLayout";
import Inicio from "./pages/dashboard/Inicio";
import Complejos from "./pages/dashboard/Complejos";
import Administradores from "./pages/dashboard/Administradores";
import Usuarios from "./pages/dashboard/Usuarios";
import SessionGate from "./components/ui/auth/SessionGate";
import RoleGuard from "./components/ui/auth/RoleGuard";
import MiCuenta from "./components/ui/auth/MiCuenta";
import Configuracion from "./pages/dashboard/Configuracion";
import DashboardComplejo from "./pages/admin_complejo/DashboardComplejo";
import MiComplejo from "./pages/admin_complejo/MiComplejo";
import Reportes from "./pages/admin_complejo/Reportes";
import HorarioComplejo from "./pages/admin_complejo/HorarioComplejo";
import BuscarCanchas from "./pages/cliente/BuscarCanchas";
import PageHeader from "./components/ui/PageHeader";
import MisEquipos from "./pages/cliente/MisEquipos";
import PartidosEquipo from "./pages/cliente/PartidosEquipo";
import MisPartidos from "./pages/cliente/MisPartidos";
import MisReservas from "./pages/cliente/MisReservas";

function IndexRouter() {
  const { usuario } = useOutletContext();

  if (usuario?.roles?.includes("ADMIN_PLATAFORMA")) {
    return <Inicio />;
  }
  if (usuario?.roles?.includes("ADMIN_COMPLEJO")) {
    return <DashboardComplejo />;
  }
  if (usuario?.roles?.includes("CLIENTE")) {
    return <ClienteDashboard usuario={usuario} />;
  }
  return <div style={{ padding: "40px", color: "white" }}>Bienvenido a Sportify.</div>;
}

function ClienteDashboard({ usuario }) {
  const tarjetas = [
    {
      to: "/dashboard/mis-equipos",
      titulo: "Mis equipos",
      descripcion: "Crea equipos, gestiona el plantel y registra partidos.",
      icono: "shield",
    },
    {
      to: "/dashboard/canchas",
      titulo: "Buscar canchas",
      descripcion: "Explora el catálogo de canchas disponibles.",
      icono: "cancha",
    },
    {
      to: "/dashboard/reservas",
      titulo: "Mis reservas",
      descripcion: "Consulta, modifica o cancela tus reservas de canchas.",
      icono: "reserva",
    },
    {
      to: "/dashboard/configuracion",
      titulo: "Mi cuenta",
      descripcion: "Consulta tus datos personales y cierra sesión.",
      icono: "user",
    },
  ];

  return (
    <>
      <PageHeader
        title={`Bienvenido, ${usuario.nombres}`}
        description="Encuentra canchas y organiza tus partidos desde Sportify."
        badge="CLIENTE"
      />
      <section className="dash-metrics" aria-label="Accesos rápidos">
        <div className="dash-metrics-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          {tarjetas.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="dash-metric-card"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="dash-metric-card-top">
                <div className="dash-metric-card-info">
                  <span className="dash-metric-label">{t.titulo.toUpperCase()}</span>
                  <span
                    className="dash-metric-value"
                    style={{ fontSize: 16, fontWeight: 400, letterSpacing: 0, lineHeight: 1.4, color: "var(--color-text-muted)" }}
                  >
                    {t.descripcion}
                  </span>
                </div>
                <span className="dash-metric-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    {t.icono === "shield" && (<><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>)}
                    {t.icono === "cancha" && (<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></>)}
                    {t.icono === "user" && (<><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a7 7 0 0 1 16 0v1" /></>)}
                    {t.icono === "reserva" && (<><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>)}
                  </svg>
                </span>
              </div>
              <div className="dash-metric-card-bottom dash-metric-card-bottom-divider" />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar" element={<RecuperarContra />} />
      <Route path="/nueva" element={<IngresaContraNueva />} />

      <Route element={<SessionGate />}>
        <Route path="/cuenta" element={<MiCuenta />} />
        <Route path="/canchas" element={<BuscarCanchas />} />
      </Route>

      <Route element={<SessionGate rolesPermitidos={["ADMIN_PLATAFORMA", "ADMIN_COMPLEJO", "CLIENTE"]} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route element={<RoleGuard rolesPermitidos={["ADMIN_PLATAFORMA", "ADMIN_COMPLEJO", "CLIENTE"]} />}>
            <Route index element={<IndexRouter />} />
          </Route>

          <Route element={<RoleGuard rolesPermitidos={["ADMIN_PLATAFORMA"]} />}>
            <Route path="complejos" element={<Complejos />} />
            <Route path="administradores" element={<Administradores />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          <Route element={<RoleGuard rolesPermitidos={["ADMIN_COMPLEJO"]} />}>
            <Route path="mi-complejo" element={<MiComplejo />} />
            <Route path="mi-complejo/horarios" element={<HorarioComplejo />} />
            <Route path="reportes" element={<Reportes />} />
          </Route>

          <Route element={<RoleGuard rolesPermitidos={["CLIENTE"]} />}>
            <Route path="mis-equipos" element={<MisEquipos />} />
            <Route path="mis-equipos/:idEquipo/partidos" element={<PartidosEquipo />} />
            <Route path="canchas" element={<BuscarCanchas />} />
            <Route path="partidos" element={<MisPartidos />} />
            <Route path="reservas" element={<MisReservas />} />
          </Route>

          <Route path="configuracion" element={<Configuracion />} />
        </Route>
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;