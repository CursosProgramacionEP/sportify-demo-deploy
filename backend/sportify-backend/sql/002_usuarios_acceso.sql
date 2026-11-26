-- Ejecutar en sportify_bd antes de arrancar esta versión.
-- Si hay correos duplicados sin distinguir mayúsculas, el índice aborta la
-- transacción: resolver esos registros explícitamente, sin eliminar cuentas aquí.
BEGIN;
ALTER TABLE public.usuario ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO';
CREATE UNIQUE INDEX IF NOT EXISTS usuario_correo_normalizado_uq ON public.usuario (lower(btrim(correo)));
UPDATE public.usuario SET correo = lower(btrim(correo)) WHERE correo <> lower(btrim(correo));
INSERT INTO public.rol (nombre) VALUES ('CLIENTE'), ('ADMIN_PLATAFORMA'), ('ADMIN_COMPLEJO')
ON CONFLICT (nombre) DO NOTHING;
COMMIT;
