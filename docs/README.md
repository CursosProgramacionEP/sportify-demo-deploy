# Documentación del proyecto

- [README e instalación](../README.md).
- [Manual de usuario](MANUAL_USUARIO.md).
- [Arquitectura, API y base de datos](DOCUMENTACION_TECNICA.md).
- [Cliente HTTP frontend](API_FRONTEND.md).
- [Iteración 3: usuarios, sesión y preparación del primer administrador](ITERACION_3_USUARIOS.md).
- [Javadoc generado](javadoc/index.html).

## Correspondencia con la rúbrica

| Requisito | Evidencia / estado |
| --- | --- |
| Javadoc o JSDoc en clases y métodos públicos del núcleo | 4 servicios, 5 clases de controladores/manejo de errores y 5 repositorios Java; contratos documentados del cliente HTTP |
| `@param`, `@return` / `@returns`, `@throws`, `@author` | Etiquetas aplicadas según el contrato; constructores sin retorno y excepciones solo donde corresponde |
| Documentación generada en `/docs` | `docs/javadoc/`, con script de regeneración en `scripts/` |
| Comentarios útiles | Condiciones de ausencia, cambios de rol, persistencia y respuestas documentadas |
| README raíz con descripción, stack, instalación, ejecución y carpetas | [README](../README.md) |
| Equipo | Cinco integrantes y responsabilidades frontend/backend en el [README](../README.md#equipo-y-entregables-externos); autoría colectiva Equipo Sportify |
| Enlace Figma | [Sportify — prototipos actuales](https://www.figma.com/design/uLjY0eqWlfBBQ230GUa95b/Sportify?node-id=0-1&t=Lieba2IlowRtDppg-1) |
| Análisis de Pantallas y Reportes | Pendiente de recibir el enlace del documento oficial |
| Configuración sin credenciales | Variables de entorno y plantillas de ejemplo; copia local ignorada |
| `.gitignore` | Excluye dependencias, compilados y configuración privada |

## Información pendiente del equipo

1. Enlace del documento oficial de Análisis de Pantallas y Reportes.
2. Completar los campos de tablas, scripts SQL y versión de PostgreSQL cuando termine su definición. La base de datos sigue en desarrollo; los espacios están preparados en el [README](../README.md#1-preparar-postgresql) y en la [documentación técnica](DOCUMENTACION_TECNICA.md#base-de-datos).

## Verificación de esta entrega

- Javadoc generado con JDK 25.0.2 y dependencias ya disponibles en la caché Maven local; validación `-Xdoclint:all -Werror` completada sin advertencias. El objetivo Java del proyecto sigue siendo 21.
- `git diff --check`: correcto.
- Exclusiones de configuración local, dependencias y compilados: comprobadas con `git check-ignore`.
- `npm run lint` y `npm run build` completados correctamente.
- `npm.cmd test`: 12 pruebas aprobadas, incluidas consulta/alta de complejos con sesión y CSRF, listado de usuarios, asociaciones y renderizado de formularios.
- Backend: 15 pruebas aisladas aprobadas (`SecurityAccessTests` y `UsuarioServiceTests`), sin conexión a PostgreSQL. Incluyen el intercambio del token CSRF real, la rotación de sesión, el rechazo del token anterior y la respuesta con el rol recién asignado.
- La actualización SQL de esta iteración no se ejecutó sobre la base local. Queda pendiente la comprobación completa con PostgreSQL siguiendo la [guía de instalación](ITERACION_3_USUARIOS.md).
- La verificación automatizada en navegador no se completó en esta sesión; no se afirma cobertura E2E completa.

Las limitaciones funcionales identificadas están en la [documentación técnica](DOCUMENTACION_TECNICA.md#limitaciones-verificadas).
