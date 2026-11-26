# Manual de usuario de Sportify

Este manual explica cómo acceder a la aplicación y utilizar las funciones disponibles según el rol de la cuenta. La instalación técnica está en el [README principal](../README.md#preparación-inicial-de-una-computadora). La versión actual sigue en desarrollo y algunas operaciones todavía están incompletas.

## 1. Antes de comenzar

Solicita al responsable de la PC la dirección de Sportify y una cuenta válida. Para desarrollo local, la interfaz se abre en `http://localhost:5173`; el backend debe estar activo en `http://localhost:8080` y conectado a una base preparada. El registro abierto crea una cuenta de cliente. No se publica una cuenta administrativa predeterminada.

## 2. Crear una cuenta de cliente

1. En la pantalla de acceso, pulsa **Regístrate** o abre `/registro`.
2. Completa nombres, apellidos, teléfono y correo electrónico.
3. Escribe una contraseña de al menos ocho caracteres y repítela en **Confirmar contraseña**.
4. Pulsa **Registrarse**. Durante el envío aparece **Registrando...**.
5. Si el servidor acepta los datos, aparece **Usuario registrado correctamente.**

El teléfono debe tener nueve dígitos y nombres/apellidos no pueden estar vacíos o contener solo espacios. Si las contraseñas no coinciden, corrígelas. Si el correo ya está registrado, inicia sesión con esa cuenta. El registro asigna el rol `CLIENTE`; no concede permisos administrativos.

## 3. Iniciar sesión y navegar

1. Abre `/login`, escribe el correo y la contraseña y pulsa **Iniciar Sesión**.
2. Una sesión válida dirige al panel según los roles asignados. La sesión expira tras 30 minutos de inactividad.
3. Usa la navegación del panel para abrir las secciones permitidas a tu cuenta. Si una ruta no corresponde al rol, la aplicación restringe el acceso.

Las cuentas con más de un rol pueden ver más de una sección. Las rutas principales son:

| Rol | Pantallas disponibles |
| --- | --- |
| `CLIENTE` | Inicio, **Mis equipos**, **Buscar canchas**, **Mis partidos** y configuración de cuenta |
| `ADMIN_COMPLEJO` | Panel del complejo, **Mi complejo**, horarios y **Reportes** |
| `ADMIN_PLATAFORMA` | **Inicio**, **Complejos**, **Administradores** y **Usuarios** |

La aplicación también tiene **Mi cuenta** (`/cuenta`). Usa **Salir** para cerrar la sesión. La opción **Mantener sesión iniciada** aparece deshabilitada.

## 4. Funciones de cliente

### Mi cuenta

Para editar el perfil, abre **Configuración** en la ruta `/dashboard/configuracion`. En el panel, el icono de perfil abre esta pantalla; el acceso rápido del cliente se llama **Mi cuenta**. En **Información Personal** puedes editar **Nombres**, **Apellidos**, **Correo Electrónico** y **Teléfono**, y luego pulsar **Guardar Cambios**. Nombres, apellidos y correo son obligatorios; el correo debe tener formato de email. El teléfono es opcional y admite vacío o exactamente nueve dígitos. Mientras se guarda, los campos se deshabilitan y el botón muestra **Guardando cambios...**. Si el servidor acepta la actualización, aparece **Tus datos se han actualizado correctamente.**; si falla, se muestra el error recibido.

La ruta `/cuenta` es una pantalla distinta: muestra el saludo, correo y roles de la sesión, con enlaces al panel y a Buscar canchas y el botón para salir. No permite editar los datos personales.

Si intentas navegar fuera de la pantalla con cambios pendientes, aparece **¿Salir sin guardar?**; elige **Quedarme** o **Salir de todos modos**. La sección **Seguridad** muestra el control **Cambiar Contraseña**, pero está deshabilitado.

### Mis equipos e integrantes

1. En el panel de cliente, abre **Mis equipos**.
2. Utiliza el formulario de la pantalla para crear un equipo o seleccionar uno existente.
3. Desde el equipo seleccionado, administra sus integrantes mediante las acciones que presenta la página. Las búsquedas de participantes usan cuentas registradas.
4. Abre la opción de partidos del equipo para consultar o gestionar los partidos asociados.

Las operaciones de equipos, integrantes y partidos están implementadas en la interfaz y el backend. Las opciones pueden requerir que la cuenta sea propietaria o integrante del equipo; sigue los mensajes que devuelva la aplicación. Esta versión no garantiza disponibilidad de adversarios ni coordinación automática de encuentros.

### Buscar canchas

Abre **Buscar canchas** desde el panel del cliente. La pantalla consulta el catálogo de canchas y muestra los datos y horarios disponibles que devuelve el servicio. Puede requerir información de complejos y horarios cargada por un administrador.

La disponibilidad mostrada se calcula a partir del catálogo y horarios; no equivale a una reserva confirmada. No hay un flujo de reserva persistida disponible para el usuario.

### Mis partidos

Abre **Mis partidos** para consultar los partidos asociados a tus equipos. También puedes acceder a los partidos desde la página de un equipo. Si no aparecen registros, verifica que exista un equipo y que se haya registrado un partido.

## 5. Funciones administrativas

Las cuentas administrativas son provisionadas por el equipo del proyecto. Si no tienes acceso a estas secciones, solicita al responsable que revise tu rol. El registro público no crea administradores.

### Administrador de plataforma

#### Inicio

La pantalla **Inicio** carga desde el backend los conteos de complejos, complejos activos, asociaciones de administración y usuarios, además de hasta diez entradas de auditoría ordenadas por fecha descendente. Si la consulta falla, muestra un error y permite **Reintentar**. Las leyendas visuales de actualización “En tiempo real” y “Registro inmutable de eventos” no garantizan actualización en tiempo real ni que los registros sean inmutables. El contenido y la hora relativa mostrados dependen de los datos devueltos por el servidor.

#### Complejos

1. Abre **Complejos** y espera la consulta.
2. Busca por texto y usa los filtros **Todos**, **Activos** o **Inactivos**.
3. Para registrar uno, pulsa **Nuevo complejo**, completa nombre, dirección, teléfono y estado, y pulsa **Confirmar**.
4. Si hay un error, revisa el mensaje y corrige el formulario. Si no hay registros, la pantalla lo indica.

La alta y consulta se guardan en el backend. Los botones de detalles, edición y cambio de estado pueden mostrarse, pero esas operaciones no están completadas. La lista no siempre incluye las asociaciones de administradores.

#### Administradores

1. Abre **Administradores** y selecciona un complejo.
2. Revisa las cuentas asociadas o pulsa **Asociar administrador**.
3. En el formulario, selecciona el complejo, busca un usuario existente y pulsa **Confirmar**.
4. Para quitar una asignación, pulsa **Quitar** en la fila correspondiente.

Quitar elimina la asociación de administración del complejo, no la cuenta del usuario. Las asignaciones nuevas a cuentas inactivas se rechazan. Comprueba cuidadosamente el usuario y complejo seleccionados antes de confirmar.

#### Usuarios

1. Abre **Usuarios** y usa la búsqueda por nombre/correo o los filtros por estado y rol.
2. Pulsa **Editar** para cambiar nombres, apellidos, correo y teléfono. El teléfono puede dejarse vacío; si se completa, debe tener nueve dígitos. No se acepta un correo que pertenezca a otra cuenta.
3. Usa **Desactivar** o **Activar** y confirma la acción. Desactivar impide el acceso, pero no borra la cuenta ni sus asociaciones.
4. Usa **Hacer admin. del sistema** o **Retirar rol de sistema** para modificar el permiso de plataforma.

No puedes desactivar tu propia cuenta ni retirar tu propio acceso de plataforma. Debe permanecer al menos un administrador de plataforma activo. El rol de administrador de complejo se gestiona desde **Administradores**.

### Administrador de complejo

- **Mi complejo** permite consultar la información del complejo vinculado a la cuenta; las acciones disponibles dependen de la implementación actual de cada campo.
- **Horarios** permite consultar y gestionar los horarios del complejo según los formularios de la pantalla.
- **Reportes** muestra la información que proporciona el servicio; confirma con el responsable si los datos están completos antes de usarlos como reporte oficial.

Si no existe un complejo asociado, solicita al administrador de plataforma que revise la asignación.

## 6. Recuperación de contraseña

El enlace **¿Olvidaste tu contraseña?** abre `/recuperar`, donde se puede ingresar un correo. El backend no envía un correo ni genera un enlace o token de recuperación. La pantalla `/nueva` valida una contraseña de al menos ocho caracteres y su confirmación, pero no la guarda. Completar esos formularios no cambia la contraseña. Solicita asistencia al responsable del sistema.

## 7. Errores comunes

| Mensaje o situación | Qué hacer |
| --- | --- |
| No se pudo conectar con el servidor | Informa al responsable. El backend o la base de datos pueden no estar disponibles. |
| Credenciales incorrectas | Revisa correo y contraseña; la recuperación no está implementada. |
| No tienes permiso o no aparece una sección | Confirma que iniciaste sesión con la cuenta correcta y solicita revisar el rol. |
| No hay complejos, canchas o equipos | Puede que aún no se hayan registrado datos. Contacta al responsable de la demostración. |
| Una búsqueda no devuelve resultados | Prueba otro texto o limpia el filtro. |
| Un formulario marca un campo | Revisa los datos obligatorios, el formato del correo, teléfono de nueve dígitos y coincidencia de contraseñas. |
| Una acción aparece pero no produce cambios | Algunas opciones visibles están incompletas. Informa la pantalla, el botón y el mensaje recibido. |

Al reportar un problema, incluye la pantalla, los pasos realizados y el texto del error. No envíes contraseñas ni otros datos sensibles.

## 8. Funciones no disponibles o limitadas

- Restablecimiento real de contraseña y envío de correos.
- Reservas de canchas, pagos y comprobantes como flujo de usuario.
- Edición, detalles y cambio de estado de complejos desde los botones pendientes.
- Confirmación de que los reportes cubren todos los datos necesarios para un uso operativo.

La disponibilidad puede cambiar entre versiones. Para instrucciones de instalación y preparación de la base de datos, consulta el [README](../README.md); los scripts SQL del repositorio son parciales y no bastan por sí solos para preparar una base vacía.
