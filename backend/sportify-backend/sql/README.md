# Actualizaciones del esquema

Hibernate está configurado con `ddl-auto=none`; estas actualizaciones se ejecutan manualmente en la base `sportify_bd`, desde Query Tool de pgAdmin.

## Fecha de asignación de administradores

1. Ejecutar el contenido de `001_fecha_asignacion_administrador.sql` en `sportify_bd`.
2. Reiniciar el backend con el perfil local.
3. Asociar un administrador y recargar el panel. La API devuelve `fechaAsignacion` como `YYYY-MM-DD` y el frontend muestra `DD/MM/YYYY`.

El script agrega una columna sin borrar registros y se puede repetir. Los registros anteriores mantienen la fecha vacía; el panel muestra «Sin fecha registrada». Solo completar fechas históricas si se conoce el dato real.

Las nuevas asociaciones reciben la fecha del calendario de `America/Lima`. Quitar y volver a asociar un administrador crea una nueva asociación con una nueva fecha. No es necesario volver a ejecutar el script completo de creación de tablas.
