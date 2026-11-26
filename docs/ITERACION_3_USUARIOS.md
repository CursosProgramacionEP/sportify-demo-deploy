# Iteración 3: gestión de usuarios y acceso

Fecha: 6 de octubre de 2026. Autoría: Equipo Sportify.

## Alcance implementado

El administrador del sistema dispone de **Usuarios** en `/dashboard/usuarios`: consulta, búsqueda por nombre o correo, filtros por estado y rol, edición de datos personales, activación/desactivación y concesión/retirada de `ADMIN_PLATAFORMA`. La asignación de `ADMIN_COMPLEJO` sigue en **Administradores**, vinculada al complejo correspondiente. El registro público siempre crea cuentas `CLIENTE`.

No se eliminan cuentas ni sus asociaciones. No se permite desactivar la propia cuenta, retirarse el acceso al panel ni dejar el sistema sin un administrador activo. El rol de plataforma se bloquea dentro de la transacción para serializar estos cambios. Los roles se verifican de nuevo en cada petición autenticada: una cuenta desactivada pierde el acceso en la siguiente solicitud, aunque ya tuviera sesión abierta.

Este bloque no completa la tercera iteración: quedan pendientes crear/editar equipos, incorporar/retirar jugadores y definir quién administra cada equipo. La etiqueta «Cliente / jugador» identifica el rol existente; no constituye una gestión de plantillas de equipos. El resumen del dashboard continúa mostrando datos de ejemplo. La recuperación de contraseña sigue pendiente.

## Preparación local, paso a paso

Estos archivos actualizan una base Sportify existente; no crean el esquema completo. No se han ejecutado sobre tu PostgreSQL durante este cambio.

1. Detén el backend antes de aplicar la actualización. Abre pgAdmin, selecciona **sportify_bd** y abre **Query Tool**. Verifica la selección con `SELECT current_database();`.
2. Abre y ejecuta [002_usuarios_acceso.sql](../backend/sportify-backend/sql/002_usuarios_acceso.sql). Añade `estado` si no existe, normaliza correos, impide duplicados sin distinguir mayúsculas y asegura los tres roles. Requiere las tablas `usuario`, `rol` y `usuario_rol` del esquema del equipo. Si encuentra correos duplicados, la transacción se rechaza: ejecuta `ROLLBACK;`, revisa esos registros y corrígelos antes de reintentar. No ejecutes nuevamente el script completo original de creación de tablas.
3. Inicia el backend desde `backend/sportify-backend` con tu configuración local habitual:

   ```powershell
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
   ```

4. En otra terminal, desde `frontend`, inicia la interfaz:

   ```powershell
   npm.cmd run dev -- --port 5173 --strictPort
   ```

5. Si todavía no tienes cuenta, regístrate en `http://localhost:5173/registro`. Si ya existe, consérvala.
6. Solo si todavía no hay un administrador del sistema activo, abre [003_primer_administrador.sql](../backend/sportify-backend/sql/003_primer_administrador.sql) en pgAdmin, sustituye `COMPLETAR_CORREO` por el correo de tu cuenta registrada y ejecuta ese bloque. El script falla si la cuenta no existe o está inactiva; no crea una cuenta ni una contraseña predeterminada. Esta es una operación de preparación del responsable de la base, no una función de registro público.
7. Entra por `http://localhost:5173/login`. Un administrador de plataforma llega al dashboard; las demás cuentas llegan a **Mi cuenta**. Abre **Usuarios** para probar la gestión.

Usa `localhost` en ambas direcciones, no mezcles `localhost` y `127.0.0.1`. Las cookies y CORS están configurados para frontend en 5173 y backend en 8080. Tras reiniciar el backend, vuelve a iniciar sesión.

## Sesión y contraseñas

Spring Security conserva la sesión en el servidor con cookie `JSESSIONID` HttpOnly y SameSite=Lax. Expira después de 30 minutos de inactividad. No se guardan contraseñas ni tokens de acceso en localStorage. **Salir** invalida la sesión y vuelve al acceso. La opción de mantener sesión entre visitas sigue deshabilitada.

Las nuevas contraseñas se almacenan con BCrypt. Una contraseña antigua en texto plano se convierte a BCrypt tras un acceso correcto; las cuentas que aún no hayan iniciado sesión conservan temporalmente su valor anterior. La columna `contrasena` debe admitir el hash de 60 caracteres (el esquema del equipo debe usar una longitud suficiente). La contraseña nueva requiere al menos ocho caracteres y como máximo 72 bytes UTF-8. Las respuestas JSON excluyen la contraseña.

Cada escritura requiere un token CSRF. El cliente consulta `/api/auth/csrf` antes de enviar la operación y adjunta el token y la cookie. Login renueva el identificador de sesión y el token. Los endpoints actuales de usuarios, complejos y asociaciones requieren `ADMIN_PLATAFORMA`; las cuentas CLIENTE y ADMIN_COMPLEJO no pueden usar el panel del sistema. Un futuro panel de complejo necesitará permisos acotados a sus asociaciones.

Para un despliegue con HTTPS, configurar también `server.servlet.session.cookie.secure=true` y el origen real en CORS. La configuración entregada corresponde al desarrollo local.

## API nueva o modificada

Todas las rutas siguientes se ubican bajo `/api`. Las respuestas de error controladas contienen `message`.

| Método y ruta | Acceso | Resultado / cuerpo |
| --- | --- | --- |
| `GET /auth/csrf` | Público | Token y `headerName`; prepara la sesión |
| `POST /auth/register` | Público + CSRF | Recibe datos personales y contraseña; devuelve `idUsuario` y `message` |
| `POST /auth/login` | Público + CSRF | Recibe `correo`, `contrasena`; devuelve cuenta sin contraseña y establece sesión |
| `GET /auth/me` | Autenticado | Cuenta actual, estado y roles |
| `POST /auth/logout` | CSRF | Invalida sesión, HTTP 204 |
| `GET /usuarios` | Administrador del sistema | Lista con datos personales, `estado` y `roles` |
| `PUT /usuarios/{id}` | Administrador + CSRF | `nombres`, `apellidos`, `correo`, `telefono`; no modifica contraseña ni roles |
| `PATCH /usuarios/{id}/estado` | Administrador + CSRF | `{"estado":"ACTIVO"}` o `{"estado":"INACTIVO"}` |
| `PUT /usuarios/{id}/rol-plataforma` | Administrador + CSRF | `{"administrador":true}` para conceder o `false` para retirar |

La identidad del administrador procede de la sesión del servidor, nunca del cuerpo JSON. Los errores habituales son 400 por campos inválidos, 401 por falta de sesión, 403 por permisos o CSRF y 409 por duplicados o cambios de acceso rechazados.

## Comprobación

Desde `backend/sportify-backend`, las pruebas aisladas no requieren tu base ni modifican datos:

```powershell
.\mvnw.cmd "-Dtest=SecurityAccessTests,UsuarioServiceTests" test
```

Cubren autenticación, roles revocados, cuentas inactivas, rotación y cierre de sesión, CSRF, CORS, validación, BCrypt, correos duplicados y protección del administrador. La prueba original de carga de contexto sigue requiriendo PostgreSQL configurado.

Desde `frontend`:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Para comprobar el flujo completo con PostgreSQL, registra una cuenta de prueba y, desde otra cuenta administradora, edita sus datos, desactívala e intenta acceder con ella. Reactívala y comprueba el acceso. Concede el rol de plataforma y verifica el dashboard; retíralo y verifica que ya no pueda consultar sus endpoints. Recarga después de cada cambio para verificar persistencia. Las pruebas automatizadas aisladas no sustituyen esta comprobación en tu entorno.
