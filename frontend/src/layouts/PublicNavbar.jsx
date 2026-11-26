import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Brand from "../components/ui/Brand";
import ThemeToggle from "../components/ui/ThemeToggle";
import "./PublicNavbar.css";

export default function PublicNavbar() {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState("inicio");
    const botonMenuRef = useRef(null);

    useEffect(() => {
        const secciones = ["inicio", "complejos", "canchas", "nosotros"]
            .map((id) => document.getElementById(id))
            .filter(Boolean);

        if (!("IntersectionObserver" in window) || secciones.length === 0) return undefined;

        const observer = new IntersectionObserver((entries) => {
            const seccionVisible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

            if (seccionVisible) setSeccionActiva(seccionVisible.target.id);
        }, {
            rootMargin: "-80px 0px -65% 0px",
            threshold: 0,
        });

        secciones.forEach((seccion) => observer.observe(seccion));
        return () => observer.disconnect();
    }, []);

    const cerrarConEscape = (event) => {
        if (event.key === "Escape" && menuAbierto) {
            setMenuAbierto(false);
            botonMenuRef.current?.focus();
        }
    };

    const navegarASeccion = (event) => {
        const destino = document.getElementById(event.currentTarget.hash.slice(1));
        if (destino) setSeccionActiva(destino.id);
        setMenuAbierto(false);
        if (destino) {
            requestAnimationFrame(() => destino.focus({ preventScroll: true }));
        }
    };

    const cerrarMenu = () => setMenuAbierto(false);

    return (
        <header className="public-navbar" onKeyDown={cerrarConEscape}>
            <div className={`public-navbar-container${menuAbierto ? " is-open" : ""}`}>
                <div className="public-navbar-left">
                    <Brand to="/" variant="home" />
                    <button
                        ref={botonMenuRef}
                        className="public-navbar-toggle"
                        type="button"
                        aria-label={menuAbierto ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
                        aria-expanded={menuAbierto}
                        aria-controls="public-navbar-links"
                        onClick={() => setMenuAbierto((abierto) => !abierto)}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            {menuAbierto
                                ? <path d="m6 6 12 12M18 6 6 18" />
                                : <path d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                    <nav id="public-navbar-links" className="public-navbar-links" aria-label="Navegación principal">
                        <a className={`public-navbar-link${seccionActiva === "inicio" ? " is-active" : ""}`} href="#inicio" onClick={navegarASeccion} aria-current={seccionActiva === "inicio" ? "location" : undefined}>Inicio</a>
                        <a className={`public-navbar-link${seccionActiva === "complejos" ? " is-active" : ""}`} href="#complejos" onClick={navegarASeccion} aria-current={seccionActiva === "complejos" ? "location" : undefined}>Complejos</a>
                        <a className={`public-navbar-link${seccionActiva === "canchas" ? " is-active" : ""}`} href="#canchas" onClick={navegarASeccion} aria-current={seccionActiva === "canchas" ? "location" : undefined}>Canchas</a>
                        <a className={`public-navbar-link${seccionActiva === "nosotros" ? " is-active" : ""}`} href="#nosotros" onClick={navegarASeccion} aria-current={seccionActiva === "nosotros" ? "location" : undefined}>Nosotros</a>
                    </nav>
                </div>

                <div className="public-navbar-actions">
                    <ThemeToggle className="theme-toggle--public" />
                    <Link to="/login" className="nav-btn-login" onClick={cerrarMenu}>Iniciar sesión</Link>
                    <Link to="/registro" className="nav-btn-register" onClick={cerrarMenu}>Crear cuenta</Link>
                </div>
            </div>
        </header>
    );
}
