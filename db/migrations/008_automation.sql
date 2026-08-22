-- ============================================
-- MIGRACIÓN 008: AUTOMATIZACIÓN Y DATOS PI
-- ============================================
-- Fecha: 2026-08-21
-- Descripción: Agrega tablas para automatización
-- y manejo de datos PI System
-- ============================================

-- ============================================
-- 1. TABLA: pi_tags (tags de PI System)
-- ============================================
-- Almacena los tags descubiertos automáticamente
CREATE TABLE IF NOT EXISTS pi_tags (
    id SERIAL PRIMARY KEY,
    tag_name TEXT NOT NULL,
    tag_path TEXT,
    equipment_id INT,
    unidad TEXT,
    fuente TEXT DEFAULT 'PI_System',
    descubierto_en TIMESTAMPTZ DEFAULT NOW(),
    ultimo_valor NUMERIC,
    ultima_actualizacion TIMESTAMPTZ,
    activo BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_pi_tags_equipo FOREIGN KEY (equipment_id) REFERENCES equipos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pi_tags_equipment ON pi_tags(equipment_id);
CREATE INDEX IF NOT EXISTS idx_pi_tags_name ON pi_tags(tag_name);

-- ============================================
-- 2. TABLA: equipos_automaticos
-- ============================================
-- Registra qué equipos fueron creados automáticamente
CREATE TABLE IF NOT EXISTS equipos_automaticos (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    creado_automaticamente BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fuente_creacion TEXT DEFAULT 'PI_System',
    ultima_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipos_auto_equipo ON equipos_automaticos(equipo_id);

-- ============================================
-- 3. TABLA: config_equipo_tags
-- ============================================
-- Configuración de qué tags mostrar en el frontend
CREATE TABLE IF NOT EXISTS config_equipo_tags (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    mostrar_en_dashboard BOOLEAN DEFAULT TRUE,
    orden_prioridad INT DEFAULT 0,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(equipo_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_config_equipo_tags_equipo ON config_equipo_tags(equipo_id);

-- ============================================
-- 4. AGREGAR COLUMNAS A TABLAS EXISTENTES
-- ============================================

-- Agregar columna de calidad a datos_sensores
ALTER TABLE datos_sensores 
ADD COLUMN IF NOT EXISTS calidad TEXT DEFAULT 'Good';

-- Agregar columna de timestamp original
ALTER TABLE datos_sensores 
ADD COLUMN IF NOT EXISTS timestamp_original TIMESTAMPTZ;

-- Agregar columna de equipo_name a config_umbrales
ALTER TABLE config_umbrales 
ADD COLUMN IF NOT EXISTS equipo_name TEXT;

-- ============================================
-- 5. FUNCIÓN: crear_equipo_automatico
-- ============================================
-- Función para crear equipos automáticamente
CREATE OR REPLACE FUNCTION crear_equipo_automatico(
    p_id INT,
    p_nombre TEXT,
    p_codigo TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_codigo TEXT;
BEGIN
    -- Verificar si el equipo ya existe
    IF EXISTS (SELECT 1 FROM equipos WHERE id = p_id) THEN
        RETURN TRUE;
    END IF;

    -- Generar código automático si no se proporciona
    v_codigo := COALESCE(p_codigo, 'PI-' || p_id::TEXT);

    -- Crear el equipo
    INSERT INTO equipos (id, codigo, nombre, area, estado, critico)
    VALUES (p_id, v_codigo, p_nombre, 'PI System', 'activo', FALSE);

    -- Registrar que fue creado automáticamente
    INSERT INTO equipos_automaticos (equipo_id, creado_automaticamente, fuente_creacion)
    VALUES (p_id, TRUE, 'PI_System');

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNCIÓN: registrar_tag_pi
-- ============================================
-- Función para registrar tags de PI System
CREATE OR REPLACE FUNCTION registrar_tag_pi(
    p_tag_name TEXT,
    p_tag_path TEXT,
    p_equipment_id INT,
    p_unidad TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
    v_tag_id INT;
BEGIN
    -- Verificar si el tag ya existe
    SELECT id INTO v_tag_id 
    FROM pi_tags 
    WHERE tag_name = p_tag_name AND equipment_id = p_equipment_id;

    IF v_tag_id IS NOT NULL THEN
        -- Actualizar existente
        UPDATE pi_tags 
        SET 
            tag_path = COALESCE(p_tag_path, tag_path),
            unidad = COALESCE(p_unidad, unidad),
            ultima_actualizacion = NOW(),
            activo = TRUE
        WHERE id = v_tag_id
        RETURNING id INTO v_tag_id;
        
        RETURN v_tag_id;
    END IF;

    -- Insertar nuevo
    INSERT INTO pi_tags (tag_name, tag_path, equipment_id, unidad)
    VALUES (p_tag_name, p_tag_path, p_equipment_id, p_unidad)
    RETURNING id INTO v_tag_id;

    -- Registrar en config_equipo_tags automáticamente
    INSERT INTO config_equipo_tags (equipo_id, tag_name, mostrar_en_dashboard, orden_prioridad)
    VALUES (p_equipment_id, p_tag_name, TRUE, 1)
    ON CONFLICT (equipo_id, tag_name) DO NOTHING;

    RETURN v_tag_id;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. CREAR VISTAS PARA EL FRONTEND
-- ============================================

-- Vista: equipos_con_tags
-- Muestra equipos con sus tags disponibles
CREATE OR REPLACE VIEW equipos_con_tags AS
SELECT 
    e.id AS equipo_id,
    e.codigo,
    e.nombre,
    e.area,
    e.estado,
    e.critico,
    COUNT(DISTINCT ds.parametro) AS total_tags,
    MAX(ds.recibido_en) AS ultimo_dato,
    COUNT(DISTINCT CASE WHEN umbrales.parametro IS NOT NULL THEN umbrales.parametro END) AS tags_con_umbrales
FROM equipos e
LEFT JOIN datos_sensores ds ON e.id = ds.equipo_id
LEFT JOIN config_umbrales umbrales ON e.id = umbrales.equipo_id
GROUP BY e.id, e.codigo, e.nombre, e.area, e.estado, e.critico
ORDER BY e.id;

-- Vista: tags_recientes_por_equipo
-- Últimos valores de cada tag por equipo
CREATE OR REPLACE VIEW tags_recientes_por_equipo AS
SELECT DISTINCT ON (equipo_id, parametro)
    equipo_id,
    parametro,
    valor,
    unidad,
    fuente,
    calidad,
    recibido_en
FROM datos_sensores
WHERE equipo_id IS NOT NULL
ORDER BY equipo_id, parametro, recibido_en DESC;

-- ============================================
-- 8. PERMISOS Y COMENTARIOS
-- ============================================

COMMENT ON TABLE pi_tags IS 'Tags de PI System descubiertos automáticamente';
COMMENT ON TABLE equipos_automaticos IS 'Equipos creados automáticamente desde PI System';
COMMENT ON TABLE config_equipo_tags IS 'Configuración de qué tags mostrar en el dashboard';
COMMENT ON FUNCTION crear_equipo_automatico IS 'Crea equipos automáticamente cuando llegan datos nuevos';
COMMENT ON FUNCTION registrar_tag_pi IS 'Registra tags de PI System automáticamente';
COMMENT ON VIEW equipos_con_tags IS 'Vista para el frontend: equipos con sus tags';
COMMENT ON VIEW tags_recientes_por_equipo IS 'Vista para el frontend: últimos valores de tags';

-- ============================================
-- 9. FIN DE MIGRACIÓN
-- ============================================