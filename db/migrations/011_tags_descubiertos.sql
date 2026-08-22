-- ============================================
-- MIGRACIÓN 011: TAGS DESCUBIERTOS
-- ============================================
-- Guarda TODA la información de tags sin equipo
-- Para que el usuario pueda decidir a qué equipo pertenecen
-- ============================================

CREATE TABLE IF NOT EXISTS tags_descubiertos (
    id SERIAL PRIMARY KEY,
    tag_name TEXT NOT NULL,
    tag_path TEXT,
    element_name TEXT,
    element_path TEXT,
    pi_point_name TEXT,
    unidad TEXT,
    ultimo_valor NUMERIC,
    ultima_actualizacion TIMESTAMPTZ,
    frecuencia INT DEFAULT 1,
    source TEXT DEFAULT 'PI_System',
    equipment_id INT,  -- NULL si no asignado
    asignado_automaticamente BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,
    UNIQUE(tag_name)
);

CREATE INDEX idx_tags_descubiertos_nombre ON tags_descubiertos(tag_name);
CREATE INDEX idx_tags_descubiertos_equipo ON tags_descubiertos(equipment_id);

COMMENT ON TABLE tags_descubiertos IS 'Tags descubiertos de PI System esperando asignación a equipo';
COMMENT ON COLUMN tags_descubiertos.tag_name IS 'Nombre del tag (ej: Ia_cal)';
COMMENT ON COLUMN tags_descubiertos.tag_path IS 'Path completo del tag en PI';
COMMENT ON COLUMN tags_descubiertos.element_name IS 'Nombre del elemento padre';
COMMENT ON COLUMN tags_descubiertos.element_path IS 'Path del elemento padre';
COMMENT ON COLUMN tags_descubiertos.pi_point_name IS 'Nombre del PI Point';
COMMENT ON COLUMN tags_descubiertos.frecuencia IS 'Cantidad de veces que se ha recibido este tag';