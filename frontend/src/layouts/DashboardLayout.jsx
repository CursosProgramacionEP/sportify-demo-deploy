import LogoutButton from "../components/ui/auth/LogoutButton";
import { Link, useLocation, useOutletContext, Outlet } from "react-router-dom";
import Brand from "../components/ui/Brand";
import ThemeToggle from "../components/ui/ThemeToggle";
import "./DashboardLayout.css";

function Header() {
    const { pathname } = useLocation();
    const { usuario } = useOutletContext();
    const isActive = (path) =>
        path === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(path);

    let navLinks = [];
    if (usuario?.roles?.includes("ADMIN_PLATAFORMA")) {
        navLinks = [
            { to: "/dashboard", label: "Inicio" },
            { to: "/dashboard/complejos", label: "Complejos" },
            { to: "/dashboard/administradores", label: "Administradores" },
            { to: "/dashboard/usuarios", label: "Usuarios" }
        ];
        if (usuario?.roles?.includes("ADMIN_COMPLEJO")) {
            navLinks.push(
                { to: "/dashboard/mi-complejo", label: "Mi complejo" },
                { to: "/dashboard/reportes", label: "Reportes" }
            );
        }
    } else if (usuario?.roles?.includes("ADMIN_COMPLEJO")) {
        navLinks = [
            { to: "/dashboard", label: "Inicio" },
            { to: "/dashboard/mi-complejo", label: "Canchas" },
            { to: "/dashboard/reportes", label: "Reportes" }
        ];
    } else if (usuario?.roles?.includes("CLIENTE")) {
        navLinks = [
            { to: "/dashboard", label: "Dashboard" },
            { to: "/dashboard/canchas", label: "Canchas" },
            { to: "/dashboard/reservas", label: "Mis Reservas" },
            { to: "/dashboard/mis-equipos", label: "Mis Equipos" },
            { to: "/dashboard/partidos", label: "Mis Partidos" },
        ];
    }

    return (
        <header className="dash-header">
            <div className="dash-header-container">
                <div className="dash-header-left">
                    <Brand to="/dashboard" variant="dashboard" />
                    <nav className="dash-header-nav" aria-label="Navegación principal">
                        {navLinks.map((link) => (
                            link.disabled ? (
                                <span
                                    key={link.label}
                                    className="dash-header-link"
                                    aria-disabled="true"
                                    title="Esta sección todavía no está disponible."
                                >
                                    {link.label}
                                </span>
                            ) : (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`dash-header-link ${isActive(link.to) ? "dash-header-link-active" : ""}`}
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </nav>
                </div>
                <div className="dash-header-right">
                    <Link
                        to="/dashboard/configuracion"
                        className="dash-header-icon"
                        aria-label="Configuración"
                        title="Mi Perfil"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
                        </svg>
                    </Link>

                    <button className="dash-header-icon" type="button" aria-label="Notificaciones">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                        </svg>
                    </button>


                    <ThemeToggle className="theme-toggle--dashboard" />
                    <LogoutButton dashboard />
                </div>
            </div>
        </header>
    );
}

function Footer() {
    return (
        <footer className="dash-footer">
            <div className="dash-footer-container">
                <Brand to="/" variant="footer" />
                <nav className="dash-footer-nav" aria-label="Información">
                    <span>Privacidad</span>
                    <span>Términos</span>
                    <span>Contacto</span>
                    <span>Soporte</span>
                </nav>
                <p className="dash-footer-copy">
                    © 2026 Sportify. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}

export default function DashboardLayout() {
    const contexto = useOutletContext();
    return (
        <div className="dash">
            <Header />
            <main className="dash-main">
                <div className="dash-content">
                    <Outlet context={contexto} />
                </div>
            </main>
            <Footer />
        </div>
    );
}

