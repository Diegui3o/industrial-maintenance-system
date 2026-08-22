-- ============================================
-- MIGRACIÓN 010: GUARDADO INTELIGENTE
-- ============================================
-- Fecha: 2026-08-21
-- Descripción: 
--   1. Tablas de prioridades
--   2. Asignación de prioridades a equipos/parámetros
--   3. Eventos especiales
--   4. Historial de eventos
--   5. Datos iniciales
-- ============================================

-- ============================================
-- 1. TABLA: config_prioridades
-- ============================================
CREATE TABLE IF NOT EXISTS config_prioridades (
    id SERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    guardar_siempre BOOLEAN DEFAULT FALSE,
    muestreo_intervalo_minutos INT DEFAULT 5,
    cambio_minimo_porcentaje NUMERIC DEFAULT 10.0,
    guardar_si_calidad_mala BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

COMMENT ON TABLE config_prioridades IS 'Niveles de prioridad para guardado de datos';
COMMENT ON COLUMN config_prioridades.nombre IS 'critico, importante, normal, baja';
COMMENT ON COLUMN config_prioridades.guardar_siempre IS 'Si es TRUE, guarda todos los datos';
COMMENT ON COLUMN config_prioridades.muestreo_intervalo_minutos IS 'Intervalo mínimo entre guardados';
COMMENT ON COLUMN config_prioridades.cambio_minimo_porcentaje IS 'Cambio % mínimo para guardar';

-- ============================================
-- 2. DATOS INICIALES: prioridades
-- ============================================
INSERT INTO config_prioridades (nombre, descripcion, guardar_siempre, muestreo_intervalo_minutos, cambio_minimo_porcentaje)
VALUES 
('critico', 'Equipos o parámetros críticos para seguridad/producción', TRUE, 1, 1.0),
('importante', 'Equipos o parámetros importantes pero no críticos', FALSE, 2, 5.0),
('normal', 'Equipos o parámetros de monitoreo estándar', FALSE, 5, 10.0),
('baja', 'Equipos o parámetros de baja prioridad', FALSE, 15, 20.0)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- 3. TABLA: config_prioridad_equipos
-- ============================================
CREATE TABLE IF NOT EXISTS config_prioridad_equipos (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    prioridad_id INT NOT NULL REFERENCES config_prioridades(id),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,
    UNIQUE(equipo_id)
);

COMMENT ON TABLE config_prioridad_equipos IS 'Asignación de prioridad a equipos específicos';

-- ============================================
-- 4. TABLA: config_prioridad_parametros
-- ============================================
CREATE TABLE IF NOT EXISTS config_prioridad_parametros (
    id SERIAL PRIMARY KEY,
    parametro TEXT NOT NULL,
    prioridad_id INT NOT NULL REFERENCES config_prioridades(id),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,
    UNIQUE(parametro)
);

COMMENT ON TABLE config_prioridad_parametros IS 'Asignación de prioridad a parámetros específicos';

-- ============================================
-- 5. TABLA: config_eventos_especiales
-- ============================================
CREATE TABLE IF NOT EXISTS config_eventos_especiales (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    prioridad_id INT NOT NULL REFERENCES config_prioridades(id),
    guardar_antes BOOLEAN DEFAULT TRUE,
    guardar_durante BOOLEAN DEFAULT TRUE,
    guardar_despues BOOLEAN DEFAULT TRUE,
    ventana_segundos_antes INT DEFAULT 30,
    ventana_segundos_despues INT DEFAULT 30,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

COMMENT ON TABLE config_eventos_especiales IS 'Eventos que activan guardado automático (cambio de estado, parada, alarma)';

-- ============================================
-- 6. DATOS INICIALES: eventos especiales
-- ============================================
-- Usar subconsultas para obtener el ID de prioridad 'critico'
INSERT INTO config_eventos_especiales (nombre, descripcion, prioridad_id, guardar_antes, guardar_durante, guardar_despues, ventana_segundos_antes, ventana_segundos_despues)
SELECT 
    'cambio_estado', 
    'Cambio de estado del equipo (activo → fallo, etc.)',
    id, TRUE, TRUE, TRUE, 30, 30
FROM config_prioridades WHERE nombre = 'critico'
UNION ALL
SELECT 
    'parada', 
    'Parada programada o no programada del equipo',
    id, TRUE, TRUE, TRUE, 60, 60
FROM config_prioridades WHERE nombre = 'critico'
UNION ALL
SELECT 
    'recuperacion', 
    'Recuperación después de una falla',
    id, TRUE, TRUE, TRUE, 30, 30
FROM config_prioridades WHERE nombre = 'critico'
UNION ALL
SELECT 
    'alarma', 
    'Cuando se genera una alarma por fuera de rango',
    id, TRUE, TRUE, TRUE, 15, 15
FROM config_prioridades WHERE nombre = 'critico'
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. TABLA: datos_eventos
-- ============================================
CREATE TABLE IF NOT EXISTS datos_eventos (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    tipo_evento TEXT NOT NULL,
    descripcion TEXT,
    estado_anterior TEXT,
    estado_nuevo TEXT,
    valor_anterior NUMERIC,
    valor_nuevo NUMERIC,
    parametro TEXT,
    timestamp_evento TIMESTAMPTZ DEFAULT NOW(),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eventos_equipo ON datos_eventos(equipo_id);
CREATE INDEX IF NOT EXISTS idx_eventos_timestamp ON datos_eventos(timestamp_evento DESC);

COMMENT ON TABLE datos_eventos IS 'Historial de eventos especiales (cambios de estado, paradas, alarmas)';

-- ============================================
-- 8. FUNCIÓN: registrar_evento_especial
-- ============================================
CREATE OR REPLACE FUNCTION registrar_evento_especial(
    p_equipo_id INT,
    p_tipo_evento TEXT,
    p_descripcion TEXT,
    p_estado_anterior TEXT DEFAULT NULL,
    p_estado_nuevo TEXT DEFAULT NULL,
    p_valor_anterior NUMERIC DEFAULT NULL,
    p_valor_nuevo NUMERIC DEFAULT NULL,
    p_parametro TEXT DEFAULT NULL
)
RETURNS INT AS $$
DECLARE
    v_evento_id INT;
BEGIN
    INSERT INTO datos_eventos (
        equipo_id,
        tipo_evento,
        descripcion,
        estado_anterior,
        estado_nuevo,
        valor_anterior,
        valor_nuevo,
        parametro,
        timestamp_evento
    ) VALUES (
        p_equipo_id,
        p_tipo_evento,
        p_descripcion,
        p_estado_anterior,
        p_estado_nuevo,
        p_valor_anterior,
        p_valor_nuevo,
        p_parametro,
        NOW()
    ) RETURNING id INTO v_evento_id;
    
    RETURN v_evento_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION registrar_evento_especial IS 'Registra un evento especial en el historial';

-- ============================================
-- 9. VISTA: vw_equipos_con_prioridad
-- ============================================
CREATE OR REPLACE VIEW vw_equipos_con_prioridad AS
SELECT 
    e.id AS equipo_id,
    e.codigo,
    e.nombre,
    e.area,
    e.estado_equipo,
    e.critico,
    COALESCE(
        cp.nombre, 
        (SELECT nombre FROM config_prioridades WHERE nombre = 'normal')
    ) AS prioridad,
    COALESCE(
        cp.guardar_siempre, 
        FALSE
    ) AS guardar_siempre,
    COALESCE(
        cp.muestreo_intervalo_minutos, 
        5
    ) AS muestreo_intervalo_minutos,
    COALESCE(
        cp.cambio_minimo_porcentaje, 
        10.0
    ) AS cambio_minimo_porcentaje
FROM equipos e
LEFT JOIN config_prioridad_equipos cpe ON e.id = cpe.equipo_id AND cpe.activo = TRUE
LEFT JOIN config_prioridades cp ON cpe.prioridad_id = cp.id;

COMMENT ON VIEW vw_equipos_con_prioridad IS 'Vista que muestra equipos con su prioridad asignada';

-- ============================================
-- 10. VISTA: vw_parametros_con_prioridad
-- ============================================
CREATE OR REPLACE VIEW vw_parametros_con_prioridad AS
SELECT 
    DISTINCT ds.parametro,
    ds.unidad,
    COALESCE(
        cp.nombre,
        (SELECT nombre FROM config_prioridades WHERE nombre = 'normal')
    ) AS prioridad,
    COALESCE(
        cp.guardar_siempre,
        FALSE
    ) AS guardar_siempre
FROM datos_sensores ds
LEFT JOIN config_prioridad_parametros cpp ON ds.parametro = cpp.parametro AND cpp.activo = TRUE
LEFT JOIN config_prioridades cp ON cpp.prioridad_id = cp.id
WHERE ds.parametro IS NOT NULL AND ds.parametro != '';

COMMENT ON VIEW vw_parametros_con_prioridad IS 'Vista que muestra parámetros con su prioridad asignada';

-- ============================================
-- 11. ASIGNAR PRIORIDAD A EQUIPOS EXISTENTES
-- ============================================
-- Asignar prioridad 'critico' a equipos que ya están marcados como críticos
INSERT INTO config_prioridad_equipos (equipo_id, prioridad_id)
SELECT 
    e.id,
    cp.id
FROM equipos e
CROSS JOIN config_prioridades cp
WHERE e.critico = TRUE 
    AND cp.nombre = 'critico'
    AND NOT EXISTS (
        SELECT 1 FROM config_prioridad_equipos cpe 
        WHERE cpe.equipo_id = e.id
    )
ON CONFLICT (equipo_id) DO NOTHING;

-- ============================================
-- 12. MENSAJE DE CONFIRMACIÓN
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migración 010 completada exitosamente';
    RAISE NOTICE '📊 Prioridades configuradas: %', (SELECT COUNT(*) FROM config_prioridades);
    RAISE NOTICE '📊 Eventos especiales configurados: %', (SELECT COUNT(*) FROM config_eventos_especiales);
    RAISE NOTICE '📊 Equipos con prioridad asignada: %', (SELECT COUNT(*) FROM config_prioridad_equipos);
END $$;