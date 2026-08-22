-- ============================================
-- MIGRACIÓN 013: MULTI-FUENTE (Porvenir, Atacocha, etc.)
-- ============================================
-- Fecha: 2026-08-22
-- Descripción: 
--   1. Agrega campos de fuente a tags_descubiertos
--   2. Actualiza vista de sugerencias
--   3. Crea índices para búsquedas por fuente
-- ============================================

-- ============================================
-- 1. AGREGAR CAMPOS DE FUENTE
-- ============================================
ALTER TABLE tags_descubiertos 
ADD COLUMN IF NOT EXISTS pi_server TEXT,
ADD COLUMN IF NOT EXISTS database_name TEXT,
ADD COLUMN IF NOT EXISTS root_element TEXT;

-- ============================================
-- 2. ACTUALIZAR VISTA DE SUGERENCIAS
-- ============================================
DROP VIEW IF EXISTS vw_sugerencias_equipos;

CREATE OR REPLACE VIEW vw_sugerencias_equipos AS
SELECT 
    COALESCE(pi_server, 'Desconocido') as pi_server,
    COALESCE(database_name, 'Desconocido') as database_name,
    COALESCE(root_element, '') as root_element,
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
GROUP BY pi_server, database_name, root_element, element_name, element_path
ORDER BY pi_server, database_name, total_tags DESC;

COMMENT ON VIEW vw_sugerencias_equipos IS 'Agrupa tags descubiertos por elemento y fuente';

-- ============================================
-- 3. CREAR ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tags_fuente ON tags_descubiertos(pi_server, database_name);
CREATE INDEX IF NOT EXISTS idx_tags_elemento ON tags_descubiertos(element_name);

-- ============================================
-- 4. FUNCIÓN PARA OBTENER FUENTES DISPONIBLES
-- ============================================
CREATE OR REPLACE FUNCTION obtener_fuentes_disponibles()
RETURNS TABLE (
    pi_server TEXT,
    database_name TEXT,
    total_tags BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.pi_server,
        t.database_name,
        COUNT(*) as total_tags
    FROM tags_descubiertos t
    WHERE t.equipo_id IS NULL
      AND t.pi_server IS NOT NULL
      AND t.database_name IS NOT NULL
    GROUP BY t.pi_server, t.database_name
    ORDER BY t.pi_server, t.database_name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_fuentes_disponibles IS 'Retorna las fuentes disponibles con cantidad de tags';

-- ============================================
-- 5. ACTUALIZAR DATOS EXISTENTES (si es necesario)
-- ============================================
-- Si hay tags sin pi_server, asignar valor por defecto
UPDATE tags_descubiertos 
SET pi_server = 'PEELPWVPIAP01NX', 
    database_name = 'BD El Porvenir'
WHERE pi_server IS NULL AND database_name IS NULL;

-- ============================================
-- 6. FIN DE MIGRACIÓN
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migración 013 completada exitosamente';
    RAISE NOTICE '📊 Fuentes disponibles: %', 
        (SELECT COUNT(DISTINCT pi_server || database_name) FROM tags_descubiertos);
END $$;