import images from "../../assets/home-images.json";

export default function ComplejoCard({ complejo, index }) {
    // Rotamos las imágenes porque la BD no guarda fotos de complejos aún
    const imagenFondo = images[index % 3];

    return (
        <article className="home-complejo">
        <div className="home-complejo-imagen">
            <img src={imagenFondo} alt={`Instalaciones de ${complejo.nombre}`} />
            <div className="home-complejo-info">
            <h3>{complejo.nombre}</h3>
            {/* Usamos la dirección real en lugar de la distancia */}
            <span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
                <circle cx="12" cy="10" r="2" />
                </svg>
                {complejo.direccion || "Sin dirección"}
            </span>
            </div>
        </div>
        </article>
    );
}