-- ============================================================
-- 023 - Corrección de temperatura ambiente del motor
-- ============================================================
--
-- El campo fue creado originalmente como NUMERIC, pero la
-- ficha técnica permite almacenar rangos como:
--
--   -20°C to +40°C
--
-- Por ello debe ser TEXT.
--
-- ============================================================

ALTER TABLE componente_motor_electrico
ALTER COLUMN ambient_temperature TYPE TEXT
USING ambient_temperature::TEXT;
