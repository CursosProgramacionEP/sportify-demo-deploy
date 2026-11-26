import { useEffect, useState } from "react";
import BuscadorCanchas from "../../components/features/BuscadorCanchas";
import CanchaCard from "../../components/features/CanchaCard";
import VerDisponibilidad from "./VerDisponibilidad";
import StatusMessage from "../../components/ui/StatusMessage";
import { listarCatalogoCanchas, obtenerDisponibilidad } from "../../services/api";
import images from "../../assets/home-images.json";
import "./BuscarCanchas.css";

function hoyISO() {
  const ahora = new Date();
  ahora.setMinutes(ahora.getMinutes() - ahora.getTimezoneOffset());
  return ahora.toISOString().slice(0, 10);
}

function aTarjeta(cancha, indice, horariosReales) {
  return {
    id: cancha.idCancha,
    idCancha: cancha.idCancha,
    idComplejo: cancha.idComplejo,
    nombre: cancha.nombre,
    club: cancha.nombreComplejo || "Sportify Club",
    direccion: cancha.direccionComplejo || "Dirección no registrada",
    distancia: 1.5, // Valor por defecto para que la tarjeta no falle
    deporte: "Fútbol", // Valor por defecto
    rating: 5.0, // Valor por defecto
    precio: cancha.precioHora,
    imagen: images[3 + (indice % 3)] || images[0],
    etiquetas: cancha.etiquetas || ["Grass Sintético"],
    horarios: horariosReales,
  };
}

export default function BuscarCanchas() {
  const [canchasOriginales, setCanchasOriginales] = useState([]);
  const [canchasFiltradas, setCanchasFiltradas] = useState([]);
  const [complejosLista, setComplejosLista] = useState([]); // Lista para el select
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [filtrosActuales, setFiltrosActuales] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function cargarCanchas() {
      setCargando(true);
      setError("");
      try {
        const datos = await listarCatalogoCanchas(controller.signal);
        const fechaHoy = hoyISO();

        const clubesUnicos = [...new Set(datos.map(c => c.nombreComplejo))].filter(Boolean);
        setComplejosLista(clubesUnicos);

        const tarjetasPromises = datos.map(async (cancha, index) => {
          let horariosReales = [];
          try {
            const slots = await obtenerDisponibilidad(cancha.idCancha, fechaHoy, controller.signal);
            horariosReales = slots
              .filter((s) => s.disponible)
              .slice(0, 3)
              .map((s) => s.horaInicio);
          } catch {
            console.warn(`No se pudo cargar disponibilidad de cancha ${cancha.idCancha}`);
          }
          
          return aTarjeta(cancha, index, horariosReales);
        });

        const tarjetas = await Promise.all(tarjetasPromises);

        if (!controller.signal.aborted) {
          setCanchasOriginales(tarjetas);
          setCanchasFiltradas(tarjetas);
        }
      } catch (err) {
        if (err.name === "AbortError" || controller.signal.aborted) return;
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    }

    cargarCanchas();
    return () => controller.abort();
  }, []);

  const handleSearch = (filtros) => {
    setFiltrosActuales(filtros);
    
    const filtradas = canchasOriginales.filter((c) => {
      const coincideTexto = filtros.texto
        ? c.nombre.toLowerCase().includes(filtros.texto.toLowerCase()) ||
          c.club.toLowerCase().includes(filtros.texto.toLowerCase())
        : true;

      const coincideClub = filtros.club === "Todos los clubes"
        ? true
        : c.club === filtros.club;

      return coincideTexto && coincideClub;
    });

    setCanchasFiltradas(filtradas);
  };

  return (
    <div style={{ width: "100%", margin: "0 auto", padding: "20px" }}>

      <BuscadorCanchas onSearch={handleSearch} complejos={complejosLista} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "32px 0 16px" }}>
        <h2 style={{ fontSize: "24px", margin: 0, color: "var(--color-text)" }}>Resultados de búsqueda</h2>
        {!cargando && !error && (
          <span style={{ color: "var(--color-text-muted)" }}>
            {canchasFiltradas.length} resultados encontrados
          </span>
        )}
      </div>

      {cargando && <p style={{ color: "var(--color-text)" }}>Cargando canchas y disponibilidad...</p>}
      {error && <StatusMessage message={error} type="error" />}

      {!cargando && !error && (
        <>
          {canchasFiltradas.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--color-text-muted)" }}>
              <p>No se encontraron canchas con esos filtros.</p>
              {filtrosActuales && (
                <button 
                  onClick={() => handleSearch({ texto: "", club: "Todos los clubes" })}
                  style={{ marginTop: "16px", color: "var(--color-primary)", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {canchasFiltradas.map((cancha) => (
                <CanchaCard 
                  key={cancha.id} 
                  cancha={cancha}
                  onVerDetalles={(c) => console.log("Ver detalles de:", c.nombre)}
                  onReservar={(c) => setCanchaSeleccionada(c)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {canchaSeleccionada && (
        <VerDisponibilidad 
          cancha={canchaSeleccionada} 
          onClose={() => setCanchaSeleccionada(null)} 
        />
      )}

    </div>
  );
}