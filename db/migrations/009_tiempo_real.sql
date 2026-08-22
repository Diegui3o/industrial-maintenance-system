-- ============================================
-- MIGRACIÓN 009: TABLA DE TIEMPO REAL
-- ============================================
-- Fecha: 2026-08-21
-- Descripción: 
--   1. Crea tabla ultimo_valor_sensor para tiempo real
--   2. Función para actualizar automáticamente
--   3. Trigger que se ejecuta en cada inserción en datos_sensores
-- ============================================

-- ============================================
-- 1. CREAR TABLA: ultimo_valor_sensor
-- ============================================
-- Guarda SOLO el último valor de cada tag
-- Para dashboard y monitoreo en tiempo real
-- Siempre tiene 1 registro por (equipo_id, parametro)
-- ============================================

CREATE TABLE IF NOT EXISTS ultimo_valor_sensor (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL,
    parametro TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    unidad TEXT,
    fuente TEXT,
    calidad TEXT DEFAULT 'Good',
    timestamp_original TIMESTAMPTZ,
    actualizado_en TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_ultimo_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE,
    UNIQUE(equipo_id, parametro)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_ultimo_equipo ON ultimo_valor_sensor(equipo_id);
CREATE INDEX IF NOT EXISTS idx_ultimo_parametro ON ultimo_valor_sensor(parametro);
CREATE INDEX IF NOT EXISTS idx_ultimo_actualizado ON ultimo_valor_sensor(actualizado_en);

-- Comentarios
COMMENT ON TABLE ultimo_valor_sensor IS 'Almacena el último valor de cada tag para tiempo real';
COMMENT ON COLUMN ultimo_valor_sensor.equipo_id IS 'ID del equipo';
COMMENT ON COLUMN ultimo_valor_sensor.parametro IS 'Nombre del parámetro/tag';
COMMENT ON COLUMN ultimo_valor_sensor.valor IS 'Último valor registrado';
COMMENT ON COLUMN ultimo_valor_sensor.unidad IS 'Unidad de medida';
COMMENT ON COLUMN ultimo_valor_sensor.fuente IS 'Fuente de los datos (PI_System, OPC, etc.)';
COMMENT ON COLUMN ultimo_valor_sensor.calidad IS 'Calidad del dato (Good, Bad, etc.)';
COMMENT ON COLUMN ultimo_valor_sensor.timestamp_original IS 'Timestamp original del dato';
COMMENT ON COLUMN ultimo_valor_sensor.actualizado_en IS 'Fecha de última actualización';

-- ============================================
-- 2. FUNCIÓN: actualizar_ultimo_valor()
-- ============================================
-- Se ejecuta automáticamente cuando se inserta un nuevo dato
-- Actualiza la tabla de tiempo real con el último valor
-- ============================================

CREATE OR REPLACE FUNCTION actualizar_ultimo_valor()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar o actualizar el último valor
    INSERT INTO ultimo_valor_sensor (
        equipo_id,
        parametro,
        valor,
        unidad,
        fuente,
        calidad,
        timestamp_original,
        actualizado_en
    )
    VALUES (
        NEW.equipo_id,
        NEW.parametro,
        NEW.valor,
        NEW.unidad,
        NEW.fuente,
        NEW.calidad,
        NEW.recibido_en,
        NOW()
    )
    ON CONFLICT (equipo_id, parametro) 
    DO UPDATE SET
        valor = EXCLUDED.valor,
        unidad = EXCLUDED.unidad,
        fuente = EXCLUDED.fuente,
        calidad = EXCLUDED.calidad,
        timestamp_original = EXCLUDED.timestamp_original,
        actualizado_en = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION actualizar_ultimo_valor() IS 'Función que actualiza la tabla de tiempo real cuando se inserta un nuevo dato en datos_sensores';

-- ============================================
-- 3. TRIGGER: trigger_actualizar_ultimo
-- ============================================
-- Se ejecuta DESPUÉS de cada INSERT en datos_sensores
-- Actualiza automáticamente la tabla ultimo_valor_sensor
-- ============================================

DROP TRIGGER IF EXISTS trigger_actualizar_ultimo ON datos_sensores;

CREATE TRIGGER trigger_actualizar_ultimo
AFTER INSERT ON datos_sensores
FOR EACH ROW
EXECUTE FUNCTION actualizar_ultimo_valor();

COMMENT ON TRIGGER trigger_actualizar_ultimo ON datos_sensores IS 'Trigger que actualiza el último valor en tiempo real';

-- ============================================
-- 4. VISTA PARA TIEMPO REAL
-- ============================================
-- Vista que combina equipo y último valor
-- Para el dashboard
-- ============================================

CREATE OR REPLACE VIEW vw_tiempo_real AS
SELECT 
    u.id AS ultimo_id,
    u.equipo_id,
    e.codigo AS equipo_codigo,
    e.nombre AS equipo_nombre,
    e.estado_equipo AS equipo_estado,
    u.parametro,
    u.valor,
    u.unidad,
    u.fuente,
    u.calidad,
    u.timestamp_original,
    u.actualizado_en,
    -- Calcular antigüedad en minutos
    EXTRACT(EPOCH FROM (NOW() - u.actualizado_en)) / 60 AS minutos_antiguedad
FROM ultimo_valor_sensor u
LEFT JOIN equipos e ON u.equipo_id = e.id
ORDER BY u.equipo_id, u.parametro;

COMMENT ON VIEW vw_tiempo_real IS 'Vista para el dashboard en tiempo real';

-- ============================================
-- 5. FUNCIÓN PARA OBTENER ÚLTIMOS DATOS DE UN EQUIPO
-- ============================================

CREATE OR REPLACE FUNCTION obtener_ultimos_datos_equipo(
    p_equipo_id INT
)
RETURNS TABLE (
    parametro TEXT,
    valor NUMERIC,
    unidad TEXT,
    actualizado_en TIMESTAMPTZ,
    minutos_antiguedad NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.parametro,
        u.valor,
        u.unidad,
        u.actualizado_en,
        EXTRACT(EPOCH FROM (NOW() - u.actualizado_en)) / 60 AS minutos_antiguedad
    FROM ultimo_valor_sensor u
    WHERE u.equipo_id = p_equipo_id
    ORDER BY u.parametro;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_ultimos_datos_equipo(INT) IS 'Función para obtener todos los últimos valores de un equipo específico';

-- ============================================
-- 6. FUNCIÓN PARA OBTENER DATOS HISTÓRICOS DE UN TAG
-- ============================================

CREATE OR REPLACE FUNCTION obtener_historico_tag(
    p_equipo_id INT,
    p_parametro TEXT,
    p_desde TIMESTAMPTZ,
    p_hasta TIMESTAMPTZ
)
RETURNS TABLE (
    valor NUMERIC,
    recibido_en TIMESTAMPTZ,
    unidad TEXT,
    calidad TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ds.valor,
        ds.recibido_en,
        ds.unidad,
        ds.calidad
    FROM datos_sensores ds
    WHERE ds.equipo_id = p_equipo_id
        AND ds.parametro = p_parametro
        AND ds.recibido_en >= p_desde
        AND ds.recibido_en <= p_hasta
    ORDER BY ds.recibido_en ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION obtener_historico_tag(INT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ) IS 'Función para obtener datos históricos de un tag específico en un rango de tiempo';

-- ============================================
-- 7. INICIALIZAR LA TABLA CON DATOS EXISTENTES
-- ============================================
-- Poblar la tabla de tiempo real con los últimos datos
-- de todos los tags que ya existen en datos_sensores
-- ============================================

INSERT INTO ultimo_valor_sensor (
    equipo_id,
    parametro,
    valor,
    unidad,
    fuente,
    calidad,
    timestamp_original,
    actualizado_en
)
SELECT DISTINCT ON (equipo_id, parametro)
    equipo_id,
    parametro,
    valor,
    unidad,
    fuente,
    'Good' AS calidad,
    recibido_en,
    NOW()
FROM datos_sensores
WHERE equipo_id IS NOT NULL
ORDER BY equipo_id, parametro, recibido_en DESC
ON CONFLICT (equipo_id, parametro) 
DO NOTHING;

-- ============================================
-- 8. FIN DE MIGRACIÓN
-- ============================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Migración 009 completada exitosamente';
    RAISE NOTICE '📊 Tabla ultimo_valor_sensor creada con % registros', 
        (SELECT COUNT(*) FROM ultimo_valor_sensor);
END $$;