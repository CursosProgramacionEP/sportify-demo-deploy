# Referencia del cliente HTTP

Fuente: [`frontend/src/services/api.js`](../frontend/src/services/api.js). Autoría documental: Equipo Sportify.

La URL base se obtiene de `VITE_API_URL` y, si falta, usa `http://localhost:8080/api`. Se eliminan las barras finales. Las solicitudes de autenticación y escritura envían JSON; las consultas usan GET.

| Función | Parámetro | Resultado resuelto | Rechazo de la promesa |
| --- | --- | --- | --- |
| `listarComplejos(signal)` | `AbortSignal` opcional | Lista de entidades con `idComplejo` y estados `ACTIVO`/`INACTIVO`; admite lista vacía | Fallo de red, HTTP no exitoso, formato inválido o cancelación |
| `registrarComplejo(complejo)` | Nombre, dirección, teléfono y estado | Entidad guardada con ID; normaliza el estado a mayúsculas | Fallo de red, HTTP no exitoso o respuesta inválida |
| `listarUsuarios(signal)` | `AbortSignal` opcional | Usuarios con ID, nombres, apellidos, teléfono y correo; excluye contraseñas | Fallo de red, HTTP no exitoso, formato inválido o cancelación |
| `listarAdministradoresComplejo(idComplejo, signal)` | ID del complejo y `AbortSignal` opcional | Asociaciones (`idUsuario`, `idComplejo`) | Fallo de red, HTTP no exitoso, formato inválido o cancelación |
| `asociarAdministradorComplejo(idComplejo, idUsuario)` | IDs del complejo y usuario | Asociación confirmada por el servidor | Fallo de red, HTTP no exitoso o respuesta inválida |
| `quitarAdministradorComplejo(idComplejo, idUsuario)` | IDs del complejo y usuario | `Promise<void>` tras HTTP 204 | Fallo de red o HTTP no exitoso |
| `registrarUsuario(usuario)` | Objeto con nombres, apellidos, teléfono, correo y `contrasena` | JSON con identificador y mensaje | Fallo de red, JSON inválido o HTTP no exitoso |
| `iniciarSesion(credenciales)` | Objeto con `correo` y `contrasena` | Cuenta con estado y roles, sin contraseña | Fallo de red o HTTP no exitoso, incluido 401 |
| `obtenerSesion(signal)` | Señal de cancelación opcional | Cuenta de la sesión actual | Error con propiedad `status`, incluido 401 |
| `cerrarSesion()` | Sin parámetros | `null` tras HTTP 204 | Fallo de red o HTTP no exitoso |
| `editarUsuario(id, datos)` | ID y datos personales | Cuenta actualizada | Validación, duplicados o permisos |
| `cambiarEstadoUsuario(id, estado)` | ID y ACTIVO/INACTIVO | Cuenta actualizada | Cambio rechazado o permisos |
| `cambiarRolPlataforma(id, administrador)` | ID y booleano de concesión | Cuenta con roles actualizados | Cambio rechazado o permisos |
| `recuperarContra(correo)` | Correo como cadena | El frontend espera texto de `/auth/recuperar` | Fallo de red o HTTP no exitoso; el endpoint aún no existe |

`services/http.js` envía la cookie de sesión mediante `credentials: include` y obtiene un token CSRF antes de cada escritura. No almacena credenciales en localStorage. `SessionGate` verifica la sesión y el rol antes de montar el panel; el servidor vuelve a comprobar permisos para cada solicitud. Los detalles de acceso y API están en [Iteración 3](ITERACION_3_USUARIOS.md).

Las funciones documentan junto a su implementación los parámetros y respuestas principales. Las excepciones de las funciones asíncronas se reciben como promesas rechazadas.
