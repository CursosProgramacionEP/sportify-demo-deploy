import images from "../../assets/home-images.json";

/**
 * Tarjeta de cancha del inicio, reutilizada en el catálogo del cliente.
 * Usa los estilos de Home.css; el botón de acción se pasa como children.
 */
export default function CanchaCatalogoCard({ cancha, index = 0, children }) {
  // Si la cancha ya tiene una imagen definida, la usamos. Si no, rotamos las locales.
  const imagenFondo = cancha.imagen || images[3 + (index % 3)];
  const activa = cancha.estado === "ACTIVA";

  return (
    <article className="home-cancha">
      <div className="home-cancha-imagen">
        <img src={imagenFondo} alt={cancha.nombre} loading="lazy" />
        <span className={`home-disponible ${activa ? "" : "is-inactive"}`}>
          <span />{activa ? "Disponible" : "No disponible"}
        </span>
      </div>
      
      <div className="home-cancha-info">
        <div className="home-cancha-titulo">
          <h3>{cancha.nombre}</h3>
          <p>S/ {cancha.precioHora}<span>/hr</span></p>
        </div>
        
        <p className="home-cancha-complejo">
          {cancha.nombreComplejo || "Complejo Deportivo"}
        </p>
        
        <ul className="home-etiquetas">
          {/* Usamos la capacidad real de la entidad */}
          {cancha.capacidad && <li>Capacidad: {cancha.capacidad}</li>}
        </ul>
        
        <div className="home-reserva">{children}</div>
      </div>
    </article>
  );
}