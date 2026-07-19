-- ============================================
-- CONFIGURACIÓN DE UMBRALES
-- ============================================
CREATE TABLE config_umbrales (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    parametro TEXT NOT NULL,
    umbral_min NUMERIC,
    umbral_max NUMERIC,
    unidad TEXT,
    severidad TEXT DEFAULT 'alta',
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

-- ============================================
-- CONFIGURACIÓN DE FUENTES DE DATOS
-- ============================================
CREATE TABLE config_fuentes (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    tipo_fuente TEXT NOT NULL,
    endpoint TEXT,
    intervalo_segundos INT DEFAULT 60,
    timeout_segundos INT DEFAULT 10,
    reintentos INT DEFAULT 3,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REGISTRO DE VALORES DE SENSORES
-- ============================================
CREATE TABLE datos_sensores (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    parametro TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    unidad TEXT,
    fuente TEXT,
    recibido_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sensores_equipo ON datos_sensores(equipo_id, recibido_en DESC);