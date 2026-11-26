-- Ejecutar en sportify_bd antes de reiniciar el backend actualizado.
-- Las asociaciones anteriores mantienen NULL: su fecha real no está registrada.
BEGIN;

ALTER TABLE public.administrador_complejo
    ADD COLUMN IF NOT EXISTS fecha_asignacion DATE;

-- Valor para futuras altas realizadas directamente mediante SQL.
ALTER TABLE public.administrador_complejo
    ALTER COLUMN fecha_asignacion
    SET DEFAULT ((CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date);

COMMIT;
