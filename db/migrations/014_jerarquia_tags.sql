-- ============================================
-- MIGRACIÓN 014: JERARQUÍA COMPLETA DE TAGS
-- ============================================

-- 1. Agregar campos de jerarquía a tags_descubiertos
ALTER TABLE tags_descubiertos 
ADD COLUMN IF NOT EXISTS ruta_completa TEXT,
ADD COLUMN IF NOT EXISTS nivel_jerarquico INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS elemento_padre TEXT,
ADD COLUMN IF NOT EXISTS path_jerarquico TEXT,
ADD COLUMN IF NOT EXISTS elementos_ancestros TEXT;

-- 2. Crear índices para búsquedas jerárquicas
CREATE INDEX IF NOT EXISTS idx_tags_ruta ON tags_descubiertos(ruta_completa);
CREATE INDEX IF NOT EXISTS idx_tags_nivel ON tags_descubiertos(nivel_jerarquico);
CREATE INDEX IF NOT EXISTS idx_tags_ancestros ON tags_descubiertos(elementos_ancestros);

-- 3. Vista para mostrar tags con jerarquía (tipo árbol)
CREATE OR REPLACE VIEW vw_tags_jerarquia AS
SELECT 
    id,
    tag_name,
    element_name,
    ruta_completa,
    nivel_jerarquico,
    elemento_padre,
    path_jerarquico,
    elementos_ancestros,
    unidad,
    ultimo_valor,
    ultima_actualizacion,
    frecuencia,
    -- Nivel de indentación para mostrar jerarquía
    REPEAT('  ', nivel_jerarquico) || tag_name as tag_con_indentacion,
    -- Primer nivel (raíz)
    SPLIT_PART(ruta_completa, ' → ', 1) as nivel_1,
    SPLIT_PART(ruta_completa, ' → ', 2) as nivel_2,
    SPLIT_PART(ruta_completa, ' → ', 3) as nivel_3,
    SPLIT_PART(ruta_completa, ' → ', 4) as nivel_4,
    SPLIT_PART(ruta_completa, ' → ', 5) as nivel_5
FROM tags_descubiertos
ORDER BY path_jerarquico, element_name;

-- 4. Función para obtener la jerarquía de un tag
CREATE OR REPLACE FUNCTION obtener_jerarquia_tag(p_tag_name TEXT)
RETURNS TABLE (
    nivel INT,
    elemento TEXT,
    ruta_completa TEXT
) AS $$
DECLARE
    v_ruta TEXT;
    v_elementos TEXT[];
    v_idx INT;
BEGIN
    -- Obtener la ruta del tag
    SELECT ruta_completa INTO v_ruta 
    FROM tags_descubiertos 
    WHERE tag_name = p_tag_name;
    
    IF v_ruta IS NULL THEN
        RETURN;
    END IF;
    
    -- Dividir la ruta en elementos
    v_elementos := string_to_array(v_ruta, ' → ');
    
    -- Devolver cada nivel
    FOR v_idx IN 1..array_length(v_elementos, 1) LOOP
        nivel := v_idx;
        elemento := v_elementos[v_idx];
        ruta_completa := array_to_string(v_elementos[1:v_idx], ' → ');
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_jerarquia_tag IS 'Obtiene la jerarquía completa de un tag específico';