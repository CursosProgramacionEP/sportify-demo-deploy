/**
 * Cliente HTTP de Sportify; utiliza la cookie de sesión y protección CSRF.
 * @module services/api
 * @author Equipo Sportify
 */
import { API_URL, apiFetch, requestJson } from "./http";

/**
 * Normaliza el estado recibido del formulario para enviarlo al backend
 * en formato canónico. Tolera "Activo", "activo", "INACTIVO", etc.
 * Uso exclusivo: registrarComplejo y modificarComplejo.
 *
 * @param {unknown} valor estado ingresado por el usuario
 * @returns {"ACTIVO"|"INACTIVO"} estado canónico
 * @author Equipo Sportify
 */
function normalizarEstadoParaEnvio(valor) {
    if (typeof valor !== "string") return "ACTIVO";
    return valor.trim().toUpperCase() === "INACTIVO" ? "INACTIVO" : "ACTIVO";
}

/**
 * Normaliza un complejo recibido del backend.
 * Solo convierte {@code null}/{@code undefined} en "ACTIVO" (tolerancia
 * histórica). Cualquier string no canónico se deja intacto para que la
 * validación posterior lo rechace, exponiendo el bug en lugar de ocultarlo.
 *
 * @param {object|null} item complejo tal como llega del servidor
 * @returns {object|null} complejo con nulls históricos ya normalizados
 * @author Equipo Sportify
 */
function normalizarComplejoRespuesta(item) {
    if (!item) return item;
    return {
        ...item,
        estado: item.estado == null ? "ACTIVO" : item.estado,
        direccion: typeof item.direccion === "string" ? item.direccion : "",
    };
}

/**
 * Consulta el catálogo de complejos persistido y normaliza los campos
 * que el backend puede devolver como {@code null} en registros históricos
 * ({@code estado}, {@code direccion}). Rechaza respuestas no canónicas.
 *
 * @param {AbortSignal} [signal] permite cancelar la solicitud al desmontar la vista
 * @returns {Promise<Array<object>>} complejos normalizados; puede ser lista vacía
 * @throws {Error} si falla la red, el HTTP o la forma de la respuesta
 * @author Equipo Sportify
 */
export async function listarComplejos(signal) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/complejos`, {
            headers: { Accept: "application/json" },
            signal,
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.", { cause: error });
    }

    if (!respuesta.ok) {
        throw new Error(`No se pudieron cargar los complejos (HTTP ${respuesta.status}). Intenta nuevamente.`);
    }

    let datos;
    try {
        datos = await respuesta.json();
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error("El servidor devolvió una respuesta inválida.", { cause: error });
    }

    if (!Array.isArray(datos)) {
        throw new Error("El servidor devolvió un listado de complejos inválido.");
    }

    const normalizados = datos.map(normalizarComplejoRespuesta);

    if (normalizados.some((item) =>
        !item ||
        !Number.isSafeInteger(item.idComplejo) ||
        typeof item.nombre !== "string" ||
        !["ACTIVO", "INACTIVO"].includes(item.estado)
    )) {
        throw new Error("El servidor devolvió un listado de complejos inválido.");
    }

    return normalizados;
}

/**
 * Persiste un complejo y devuelve los datos confirmados por el servidor.
 * Normaliza {@code estado} para aceptar tanto "Activo"/"Inactivo" (formulario)
 * como "ACTIVO"/"INACTIVO" ya canónicos.
 *
 * @param {{nombre:string, direccion:string, telefono:string, estado:string}} complejo
 * @returns {Promise<object>} complejo guardado con idComplejo
 * @throws {Error} si falla la red, el HTTP o la forma de la respuesta
 * @author Equipo Sportify
 */
export async function registrarComplejo(complejo) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/complejos`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...complejo,
                estado: normalizarEstadoParaEnvio(complejo.estado),
            }),
        });
    } catch (error) {
        throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.", { cause: error });
    }

    const cuerpo = await respuesta.text();
    let datos = null;
    if (cuerpo) {
        try {
            datos = JSON.parse(cuerpo);
        } catch (error) {
            if (respuesta.ok) {
                throw new Error("El servidor devolvió una respuesta inválida.", { cause: error });
            }
        }
    }

    if (!respuesta.ok) {
        throw new Error(
            datos?.message || datos?.detail || cuerpo ||
            `No se pudo registrar el complejo (HTTP ${respuesta.status}).`
        );
    }

    if (!datos || !Number.isSafeInteger(datos.idComplejo) ||
        typeof datos.nombre !== "string" ||
        typeof datos.direccion !== "string" ||
        !["ACTIVO", "INACTIVO"].includes(datos.estado)) {
        throw new Error("El servidor devolvió un complejo guardado inválido.");
    }

    return datos;
}

/**
 * Consulta usuarios para asignación; solo incluye datos de contacto.
 * @param {AbortSignal} [signal] Permite cancelar la solicitud.
 * @returns {Promise<Array<{idUsuario: number, nombres: string, apellidos: string, telefono: string|null, correo: string}>>}
 */
export async function listarUsuarios(signal) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/usuarios`, {
            headers: { Accept: "application/json" },
            signal,
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error("No se pudieron cargar los usuarios. Intenta nuevamente.", { cause: error });
    }

    if (!respuesta.ok) {
        throw new Error(`No se pudieron cargar los usuarios (HTTP ${respuesta.status}).`);
    }

    let datos;
    try {
        datos = await respuesta.json();
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error("El servidor devolvió una lista de usuarios inválida.", { cause: error });
    }

    if (!Array.isArray(datos) || datos.some((usuario) =>
        !usuario || !Number.isSafeInteger(usuario.idUsuario) ||
        typeof usuario.nombres !== "string" || typeof usuario.apellidos !== "string" ||
        typeof usuario.correo !== "string" ||
        (usuario.telefono != null && typeof usuario.telefono !== "string")
    )) {
        throw new Error("El servidor devolvió una lista de usuarios inválida.");
    }

    return datos;
}

/** Lista las asociaciones persistidas para un complejo. */
export async function listarAdministradoresComplejo(idComplejo, signal) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/complejos/${idComplejo}/administradores`, {
            headers: { Accept: "application/json" },
            signal,
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error("No se pudieron cargar los administradores. Intenta nuevamente.", { cause: error });
    }

    if (!respuesta.ok) {
        throw new Error(`No se pudieron cargar los administradores (HTTP ${respuesta.status}).`);
    }

    const datos = await respuesta.json();
    if (!Array.isArray(datos) || datos.some((item) =>
        !item || !Number.isSafeInteger(item.idUsuario) || !Number.isSafeInteger(item.idComplejo)
    )) {
        throw new Error("El servidor devolvió asociaciones de administradores inválidas.");
    }
    return datos;
}

/** Asocia un usuario existente con un complejo. */
export async function asociarAdministradorComplejo(idComplejo, idUsuario) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/complejos/${idComplejo}/administradores`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ idUsuario }),
        });
    } catch (error) {
        throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.", { cause: error });
    }

    const cuerpo = await respuesta.text();
    let datos = null;
    if (cuerpo) {
        try {
            datos = JSON.parse(cuerpo);
        } catch {
            if (respuesta.ok) throw new Error("El servidor devolvió una asociación inválida.");
        }
    }
    if (!respuesta.ok) {
        throw new Error(datos?.message || datos?.detail || cuerpo || "No se pudo asociar al administrador.");
    }
    if (datos?.idUsuario !== idUsuario || datos?.idComplejo !== idComplejo) {
        throw new Error("El servidor devolvió una asociación inválida.");
    }
    return datos;
}

/** Quita una asociación sin eliminar la cuenta del usuario. */
export async function quitarAdministradorComplejo(idComplejo, idUsuario) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/complejos/${idComplejo}/administradores/${idUsuario}`, {
            method: "DELETE",
        });
    } catch (error) {
        throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.", { cause: error });
    }

    if (!respuesta.ok) {
        const mensaje = await respuesta.text();
        throw new Error(mensaje || `No se pudo quitar al administrador (HTTP ${respuesta.status}).`);
    }
}

/**
 * Envía el alta y analiza JSON solo cuando el servidor declara ese formato.
 * @param {{nombres: string, apellidos: string, telefono: string, correo: string, contrasena: string}} usuario Datos del formulario.
 * @returns {Promise<object|null>} JSON recibido o null si el servidor responde texto.
 * @throws {Error} Rechaza la promesa si falla la red, el JSON o el estado HTTP.
 * @author Equipo Sportify
 */
export async function registrarUsuario(usuario) {
    let respuesta;

    try {
        respuesta = await apiFetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(usuario),
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.");
    }

    const contentType = respuesta.headers.get("content-type");

    const cuerpo = await respuesta.text();
    let datos = null;

    if (cuerpo && (contentType?.includes("application/json") || contentType?.includes("+json"))) {
        try {
            datos = JSON.parse(cuerpo);
        } catch {
            throw new Error("El servidor devolvió una respuesta inválida.");
        }
    }

    if (!respuesta.ok) {
        throw new Error(
            datos?.mensaje || datos?.message || datos?.detail || "No se pudo registrar al usuario."
        );
    }

    return datos;
}


/**
 * Inicia una sesión HTTP y devuelve la cuenta con sus roles actuales.
 * @param {{correo: string, contrasena: string}} credenciales Datos de acceso.
 * @returns {Promise<object>} Cuenta autenticada sin contraseña.
 * @throws {Error} Rechaza la promesa si falla la red o el servidor rechaza la solicitud.
 * @author Equipo Sportify
 */
export async function iniciarSesion(credenciales) {
    return requestJson("/auth/login", { method: "POST", body: credenciales });
}

/**
 * Solicita recuperación al endpoint previsto, todavía ausente en el backend.
 * @param {string} correo Dirección indicada por el usuario.
 * @returns {Promise<string>} Texto de una eventual respuesta exitosa del servidor.
 * @throws {Error} Rechaza la promesa si falla la red o se recibe un error HTTP.
 * @author Equipo Sportify
 */
export async function recuperarContra(correo) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/auth/recuperar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo }),
        });
    } catch {
        throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.");
    }

    const cuerpo = await respuesta.text();

    if (!respuesta.ok) {
        throw new Error(cuerpo || "No se pudo procesar la solicitud.");
    }

    return cuerpo;
}

/**
 * Recupera del servidor la identidad y permisos de la sesión actual.
 * @param {AbortSignal} [signal] Cancelación al salir de la pantalla.
 * @returns {Promise<object>} Cuenta sin contraseña.
 * @throws {Error} Error con status 401 si no existe sesión, u otro fallo HTTP/red.
 * @author Equipo Sportify
 */
export const obtenerSesion = (signal) => requestJson("/auth/me", { signal });
/**
 * Invalida la sesión del servidor antes de abandonar la zona privada.
 * @returns {Promise<null>} Confirmación de HTTP 204.
 * @throws {Error} Fallo HTTP, de CSRF o conexión.
 * @author Equipo Sportify
 */
export const cerrarSesion = () => requestJson("/auth/logout", { method: "POST" });
/**
 * Guarda los datos personales admitidos sin modificar contraseña ni permisos.
 * @param {number} id Identificador de la cuenta.
 * @param {object} datos Nombres, apellidos, correo y teléfono.
 * @returns {Promise<object>} Cuenta persistida.
 * @throws {Error} Validación, duplicado, falta de permisos o fallo de conexión.
 * @author Equipo Sportify
 */
export const editarUsuario = (id, datos) => requestJson(`/usuarios/${id}`, { method: "PUT", body: datos });
/**
 * Solicita activar o desactivar una cuenta conservando sus asociaciones.
 * @param {number} id Identificador de la cuenta.
 * @param {string} estado ACTIVO o INACTIVO.
 * @returns {Promise<object>} Cuenta persistida.
 * @throws {Error} Cambio rechazado, falta de permisos o fallo de conexión.
 * @author Equipo Sportify
 */
export const cambiarEstadoUsuario = (id, estado) => requestJson(`/usuarios/${id}/estado`, { method: "PATCH", body: { estado } });
/**
 * Modifica únicamente el permiso de administración del sistema.
 * @param {number} id Identificador de la cuenta.
 * @param {boolean} administrador true concede; false retira.
 * @returns {Promise<object>} Cuenta con roles actualizados.
 * @throws {Error} Cambio rechazado, falta de permisos o fallo de conexión.
 * @author Equipo Sportify
 */
export const cambiarRolPlataforma = (id, administrador) => requestJson(`/usuarios/${id}/rol-plataforma`, { method: "PUT", body: { administrador } });

export async function listarTodosAdministradores(signal) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/complejos/administradores`, {
            headers: { Accept: "application/json" },
            signal,
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error("No se pudieron cargar los administradores. Intenta nuevamente.", { cause: error });
    }

    if (respuesta.status === 404) return [];
    if (!respuesta.ok) throw new Error(`Error al cargar administradores (HTTP ${respuesta.status}).`);

    const datos = await respuesta.json();
    if (!Array.isArray(datos)) return [];

    return datos;
}

export async function listarMetricas(signal) {
    let respuesta;
    try {
        respuesta = await apiFetch(`${API_URL}/dashboard/metricas`, {
            headers: { Accept: "application/json" },
            signal,
        });
    } catch (error) {
        if (signal?.aborted) throw error;
        throw new Error("No se pudieron cargar las métricas. Intenta nuevamente.", { cause: error });
    }

    if (!respuesta.ok) {
        throw new Error(`No se pudieron cargar las métricas (HTTP ${respuesta.status}).`);
    }

    const datos = await respuesta.json();

    if (typeof datos !== "object" || datos === null) {
        throw new Error("El servidor devolvió métricas inválidas.");
    }
    return datos;
}

/**
 * Actualiza los campos editables de un complejo. Normaliza {@code estado}
 * antes de enviarlo, para que el backend nunca reciba {@code null} ni
 * variantes en minúsculas que romperían la auditoría.
 *
 * @param {number} id identificador del complejo
 * @param {object} datos campos editables (nombre, direccion, telefono, estado)
 * @returns {Promise<object>} complejo actualizado según el servidor
 * @throws {Error} si falla la red, el HTTP o la validación
 * @author Equipo Sportify
 */
export async function modificarComplejo(id, datos) {
    const payload = {
        ...datos,
        estado: normalizarEstadoParaEnvio(datos.estado),
    };
    return requestJson(`/complejos/${id}`, {
        method: "PUT",
        body: payload,
    });
}

export const listarActividad = (signal) => requestJson("/dashboard/actividad", { signal });

export const listarCanchas = (idComplejo, signal) =>
    requestJson(`/complejos/${idComplejo}/canchas`, { signal });
export const registrarCancha = (idComplejo, datos) =>
    requestJson(`/complejos/${idComplejo}/canchas`, { method: "POST", body: datos });
export const modificarCancha = (idCancha, datos) =>
    requestJson(`/canchas/${idCancha}`, { method: "PUT", body: datos });

export const cambiarEstadoCancha = (idCancha, estado) =>
    requestJson(`/canchas/${idCancha}/estado?estado=${estado}`, { method: "PATCH" });
/**
 * Obtiene los complejos asignados al administrador actualmente logueado.
 */
export const listarMisComplejos = (signal) => requestJson("/complejos/mio", { signal });

/** Catálogo para el cliente: todas las canchas de todos los complejos. GET /api/canchas */
export const listarCatalogoCanchas = (signal) => requestJson("/canchas", { signal });

/** Horas de una cancha en una fecha. GET /api/canchas/{id}/disponibilidad?fecha=YYYY-MM-DD */
export const obtenerDisponibilidad = (idCancha, fecha, signal) =>
    requestJson(`/canchas/${idCancha}/disponibilidad?fecha=${fecha}`, { signal });
// Equipos
export const listarMisEquipos = (signal) => requestJson("/equipos/mios", { signal });

export const obtenerEquipo = (idEquipo, signal) =>
    requestJson(`/equipos/${idEquipo}`, { signal });

export const crearEquipo = (datos) =>
    requestJson("/equipos", { method: "POST", body: datos });

export const editarEquipo = (idEquipo, nombre) =>
    requestJson(`/equipos/${idEquipo}`, { method: "PUT", body: { nombre } });

export const cambiarNivelEquipo = (idEquipo, nivel) =>
    requestJson(`/equipos/${idEquipo}/nivel`, { method: "PATCH", body: { nivel } });

export const cambiarEstadoEquipo = (idEquipo, estado) =>
    requestJson(`/equipos/${idEquipo}/estado`, { method: "PATCH", body: { estado } });

export const transferirCapitan = (idEquipo, idUsuario) =>
    requestJson(`/equipos/${idEquipo}/capitan`, { method: "PATCH", body: { idUsuario } });


// Jugadores
export const buscarJugador = (correo, signal) =>
    requestJson(`/equipos/buscar-jugador?correo=${encodeURIComponent(correo)}`, { signal });

export const listarJugadores = (idEquipo, signal) =>
    requestJson(`/equipos/${idEquipo}/jugadores`, { signal });

export const agregarJugador = (idEquipo, idUsuario) =>
    requestJson(`/equipos/${idEquipo}/jugadores`, { method: "POST", body: { idUsuario } });

export const retirarJugador = (idEquipo, idUsuario) =>
    requestJson(`/equipos/${idEquipo}/jugadores/${idUsuario}`, { method: "DELETE" });

// Partidos
export const listarPartidos = (idEquipo, signal) =>
    requestJson(`/equipos/${idEquipo}/partidos`, { signal });

export const registrarPartido = (idEquipo, datos) =>
    requestJson(`/equipos/${idEquipo}/partidos`, { method: "POST", body: datos });

export const editarPartido = (idEquipo, idPartido, datos) =>
    requestJson(`/equipos/${idEquipo}/partidos/${idPartido}`, { method: "PUT", body: datos });

export const eliminarPartido = (idEquipo, idPartido) =>
    requestJson(`/equipos/${idEquipo}/partidos/${idPartido}`, { method: "DELETE" });
/** Días en que abre un complejo. GET /api/complejos/{id}/horarios (un día cerrado no aparece). */
export const listarHorarios = (idComplejo, signal) =>
    requestJson(`/complejos/${idComplejo}/horarios`, { signal });

/** Reemplaza el horario semanal. PUT /api/complejos/{id}/horarios con la lista de días abiertos. */
export const guardarHorarios = (idComplejo, horarios) =>
    requestJson(`/complejos/${idComplejo}/horarios`, { method: "PUT", body: horarios });

// Reservas
/** Crea una reserva PENDIENTE. POST /api/reservas { idCancha, fecha, horaInicio, horaFin } */
export const crearReserva = (datos) =>
    requestJson("/reservas", { method: "POST", body: datos });

/** Reservas del usuario autenticado. GET /api/reservas/mias */
export const listarMisReservas = (signal) => requestJson("/reservas/mias", { signal });

/** Consulta una reserva. GET /api/reservas/{id} */
export const obtenerReserva = (idReserva, signal) =>
    requestJson(`/reservas/${idReserva}`, { signal });

/** Cambia fecha/franja. PUT /api/reservas/{id} { fecha, horaInicio, horaFin } */
export const modificarReserva = (idReserva, datos) =>
    requestJson(`/reservas/${idReserva}`, { method: "PUT", body: datos });

/** Cancela una reserva. PATCH /api/reservas/{id}/cancelar */
export const cancelarReserva = (idReserva) =>
    requestJson(`/reservas/${idReserva}/cancelar`, { method: "PATCH" });

/** Confirma una reserva (admin del complejo). PATCH /api/reservas/{id}/confirmar */
export const confirmarReserva = (idReserva) =>
    requestJson(`/reservas/${idReserva}/confirmar`, { method: "PATCH" });

/** Reservas de un complejo (admin). GET /api/complejos/{id}/reservas?fecha=YYYY-MM-DD */
export const listarReservasComplejo = (idComplejo, fecha, signal) =>
    requestJson(`/complejos/${idComplejo}/reservas${fecha ? `?fecha=${fecha}` : ""}`, { signal });
