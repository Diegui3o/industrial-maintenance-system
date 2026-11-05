-- ============================================================
-- Migración 037: activo_tipo en alarmas
-- ============================================================
-- Objetivo:
--   Distinguir explícitamente si una alarma es de equipo,
--   componente o repuesto, sin tener que deducirlo de qué columnas
--   están rellenas.
--
-- Idempotente. No modifica datos existentes.
-- ============================================================

BEGIN;

ALTER TABLE alarmas
    ADD COLUMN IF NOT EXISTS activo_tipo text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'alarmas_activo_tipo_check'
    ) THEN
        ALTER TABLE alarmas
            ADD CONSTRAINT alarmas_activo_tipo_check
            CHECK (activo_tipo IS NULL OR activo_tipo IN ('equipo','componente','repuesto'));
    END IF;
END $$;

-- Backfill: las alarmas existentes son todas de equipo
UPDATE alarmas
SET activo_tipo = 'equipo'
WHERE activo_tipo IS NULL
  AND equipo_id IS NOT NULL
  AND componente_id IS NULL
  AND repuesto_id IS NULL;

COMMIT;