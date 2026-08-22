-- ============================================
-- MIGRACIÓN 012: ASIGNACIÓN DE TAGS A EQUIPOS
-- ============================================

-- 1. Agregar columna equipo_id a tags_descubiertos (si no existe)
ALTER TABLE tags_descubiertos 
ADD COLUMN IF NOT EXISTS equipo_id INT REFERENCES equipos(id) ON DELETE SET NULL;

-- 2. Crear índice para búsquedas por equipo
CREATE INDEX IF NOT EXISTS idx_tags_descubiertos_equipo ON tags_descubiertos(equipo_id);

-- 3. Vista para agrupar tags por elemento (sugerencias de equipos)
CREATE OR REPLACE VIEW vw_sugerencias_equipos AS
SELECT 
    element_name,
    element_path,
    COUNT(*) as total_tags,
    ARRAY_AGG(DISTINCT tag_name ORDER BY tag_name) as tags,
    ARRAY_AGG(DISTINCT unidad ORDER BY unidad) as unidades,
    MAX(ultimo_valor) as ultimo_valor_max,
    MAX(ultima_actualizacion) as ultima_actualizacion
FROM tags_descubiertos
WHERE equipo_id IS NULL
  AND element_name IS NOT NULL 
  AND element_name != ''
GROUP BY element_name, element_path
ORDER BY total_tags DESC;

COMMENT ON VIEW vw_sugerencias_equipos IS 'Agrupa tags descubiertos por elemento para sugerir equipos';

-- 4. Función para asignar tags a un equipo
CREATE OR REPLACE FUNCTION asignar_tags_a_equipo(
    p_equipo_id INT,
    p_tag_names TEXT[]
)
RETURNS INT AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE tags_descubiertos 
    SET equipo_id = p_equipo_id
    WHERE tag_name = ANY(p_tag_names)
      AND equipo_id IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION asignar_tags_a_equipo IS 'Asigna una lista de tags a un equipo';