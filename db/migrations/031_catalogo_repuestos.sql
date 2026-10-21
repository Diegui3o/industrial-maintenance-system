
-- Ampliacion aditiva del catalogo de repuestos.
-- No modifica ni elimina columnas existentes.
-- No inserta ni reasigna registros.

ALTER TABLE repuestos
    ADD COLUMN IF NOT EXISTS codigo_sap TEXT,
    ADD COLUMN IF NOT EXISTS categoria TEXT,
    ADD COLUMN IF NOT EXISTS criticidad TEXT,
    ADD COLUMN IF NOT EXISTS stock_actual NUMERIC(12,3) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS stock_minimo NUMERIC(12,3) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS unidad_medida TEXT,
    ADD COLUMN IF NOT EXISTS marca TEXT,
    ADD COLUMN IF NOT EXISTS modelo TEXT,
    ADD COLUMN IF NOT EXISTS especificaciones_tecnicas TEXT;
