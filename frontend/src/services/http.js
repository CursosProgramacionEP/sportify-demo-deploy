export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(/\/+$/, "");

/**
 * Envía la cookie de sesión y un token CSRF fresco en cada operación de escritura.
 * @param {string} url Endpoint de la API.
 * @param {object} [options] Opciones fetch, incluida cancelación.
 * @returns {Promise<Response>} Respuesta HTTP sin consumir su cuerpo.
 * @throws {Error} Si falla la red o no puede obtenerse el token CSRF.
 * @author Equipo Sportify
 */
export async function apiFetch(url, options = {}) {
  const headers = { ...options.headers };
  if (!["GET", "HEAD", "OPTIONS"].includes(options.method || "GET")) {
    const response = await fetch(`${API_URL}/auth/csrf`, { credentials: "include", signal: options.signal });
    if (!response.ok) throw new Error("No se pudo preparar la sesión. Recarga e intenta nuevamente.");
    const csrf = await response.json();
    if (!csrf.token || !csrf.headerName) throw new Error("El servidor devolvió una sesión de seguridad inválida.");
    headers[csrf.headerName] = csrf.token;
  }
  const response = await fetch(url, { ...options, headers, credentials: "include" });
  if ([401, 403].includes(response.status) && !url.includes("/auth/") && typeof window !== "undefined") {
    window.dispatchEvent(new Event("sportify:revisar-sesion"));
  }
  return response;
}

/**
 * Conserva el estado HTTP para distinguir sesión, permisos y validación.
 * @param {string} path Ruta relativa a la API.
 * @param {object} [options] Método, cuerpo JSON y señal de cancelación.
 * @returns {Promise<object|null>} JSON recibido o null tras HTTP 204.
 * @throws {Error} Fallo de red, formato o HTTP; este último incluye status.
 * @author Equipo Sportify
 */
export async function requestJson(path, { body, ...options } = {}) {
  let response;
  try {
    response = await apiFetch(`${API_URL}${path}`, {
      ...options,
      headers: { Accept: "application/json", ...(body !== undefined && { "Content-Type": "application/json" }) },
      ...(body !== undefined && { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error("No se pudo conectar con el servidor. Intenta nuevamente.", { cause: error });
  }
  if (response.status === 204) return null;
  const datos = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(datos?.message || `No se pudo completar la solicitud (HTTP ${response.status}).`);
    error.status = response.status;
    throw error;
  }
  if (datos === null) throw new Error("El servidor devolvió una respuesta inválida.");
  return datos;
}
