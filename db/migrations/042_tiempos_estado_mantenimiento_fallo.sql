-- ============================================================
-- Migración 042: ampliar CHECK de tiempos_activo_sensor.estado
-- ============================================================
-- Añade 'mantenimiento' y 'fallo' a los estados permitidos.
-- Sin esto, los INSERT del motor al transicionar a mantenimiento
-- o fallo fallan con check constraint.
-- ============================================================

BEGIN;

-- Eliminar el CHECK antiguo
ALTER TABLE tiempos_activo_sensor
    DROP CONSTRAINT IF EXISTS tiempos_activo_sensor_estado_check;

-- Añadir el nuevo CHECK con los 5 estados
ALTER TABLE tiempos_activo_sensor
    ADD CONSTRAINT tiempos_activo_sensor_estado_check
    CHECK (estado = ANY (ARRAY['activo','inactivo','sin_dato','mantenimiento','fallo']));

COMMIT;