-- Reemplazar COMPLETAR_CORREO por el correo de una cuenta registrada y activa.
-- Ejecutar una sola vez para designar al responsable inicial, desde pgAdmin.
DO $$
DECLARE
    correo_responsable TEXT := 'COMPLETAR_CORREO';
    usuario_id INTEGER;
    rol_id INTEGER;
BEGIN
    SELECT id_usuario INTO STRICT usuario_id FROM public.usuario
    WHERE lower(correo) = lower(correo_responsable) AND estado = 'ACTIVO';
    SELECT id_rol INTO STRICT rol_id FROM public.rol WHERE nombre = 'ADMIN_PLATAFORMA';
    INSERT INTO public.usuario_rol (id_usuario, id_rol) VALUES (usuario_id, rol_id)
    ON CONFLICT DO NOTHING;
END $$;
