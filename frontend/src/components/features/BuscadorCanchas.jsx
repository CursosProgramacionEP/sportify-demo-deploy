import { useState } from "react";
import "./BuscadorCanchas.css";

function SearchIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
    );
    }
    function NavigationIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
    );
    }
    function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    );
    }

    export default function BuscadorCanchas({ onSearch, complejos = [] }) {
    const [filtros, setFiltros] = useState({
        texto: "",
        ubicacion: "",
        fecha: "",
        hora: "",
        club: "Todos los clubes"
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(filtros);
    };

    const handleUbicacionActual = () => {
        alert("Obteniendo ubicación actual...");
    };

    // Generamos las horas de 08:00 a 22:00 para el selector
    const opcionesHoras = Array.from({ length: 15 }, (_, i) => {
        const hora = String(i + 8).padStart(2, "0");
        return `${hora}:00`;
    });

    return (
        <div className="buscador-canchas-wrapper">
        <div className="buscador-title">
            <SearchIcon />
            <h2>Buscar Canchas</h2>
        </div>

        <form onSubmit={handleSubmit} className="buscador-form">
            <div className="buscador-row-1">
            <div className="buscador-field">
                <label>Buscar cancha o club</label>
                <div className="input-with-icon">
                <input
                    type="text"
                    name="texto"
                    placeholder="Nombre de cancha, club o características..."
                    value={filtros.texto}
                    onChange={handleChange}
                />
                </div>
            </div>

            <div className="buscador-field">
                <label>Buscar por ubicación</label>
                <div className="input-with-icon">
                <span className="left-icon"><SearchIcon /></span>
                <input
                    type="text"
                    name="ubicacion"
                    placeholder="Buscar distrito, dirección o lugar..."
                    value={filtros.ubicacion}
                    onChange={handleChange}
                />
                </div>
            </div>
            </div>

            <div className="buscador-row-2">
            <button type="button" className="btn-location" onClick={handleUbicacionActual}>
                <NavigationIcon />
                Usar mi ubicación actual
            </button>
            </div>

            <div className="buscador-row-3">
            <div className="buscador-field">
                <label>Fecha</label>
                <div className="input-with-icon">
                <span className="left-icon"><CalendarIcon /></span>
                <input
                    type="date"
                    name="fecha"
                    value={filtros.fecha}
                    onChange={handleChange}
                />
                </div>
            </div>

            <div className="buscador-field">
                <label>Hora</label>
                <select name="hora" value={filtros.hora} onChange={handleChange}>
                <option value="">Cualquier hora</option>
                {opcionesHoras.map((h) => (
                    <option key={h} value={h}>{h}</option>
                ))}
                </select>
            </div>

            <div className="buscador-field">
                <label>Club / Complejo</label>
                <select name="club" value={filtros.club} onChange={handleChange}>
                <option value="Todos los clubes">Todos los clubes</option>
                {complejos.map((nombre) => (
                    <option key={nombre} value={nombre}>{nombre}</option>
                ))}
                </select>
            </div>

            <button type="submit" className="btn-search">
                <SearchIcon />
                Buscar
            </button>
            </div>
        </form>
        </div>
    );
}