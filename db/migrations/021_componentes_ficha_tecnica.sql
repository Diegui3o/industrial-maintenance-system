BEGIN;

-- ============================================================
-- COMPONENTES
-- DATOS GENERALES
-- ============================================================

ALTER TABLE componentes_equipo
    ADD COLUMN IF NOT EXISTS tipo_componente TEXT,
    ADD COLUMN IF NOT EXISTS codigo_sap TEXT,
    ADD COLUMN IF NOT EXISTS tag TEXT,
    ADD COLUMN IF NOT EXISTS marca TEXT,
    ADD COLUMN IF NOT EXISTS modelo TEXT,
    ADD COLUMN IF NOT EXISTS numero_serie TEXT;


-- ============================================================
-- MOTOR ELÉCTRICO
-- FICHA TÉCNICA ESPECÍFICA
-- ============================================================

CREATE TABLE IF NOT EXISTS componente_motor_electrico (
    componente_id INT PRIMARY KEY
        REFERENCES componentes_equipo(id)
        ON DELETE CASCADE,

    -- Identificación técnica
    placa_motor TEXT,
    fabricante TEXT,
    codigo_fabricante TEXT,
    producto TEXT,

    -- Características eléctricas
    rated_voltage TEXT,
    rated_current TEXT,
    frequency NUMERIC(10,3),
    phases INTEGER,
    power_factor NUMERIC(10,5),
    efficiency NUMERIC(10,3),
    service_factor NUMERIC(10,3),

    -- Potencia y velocidad
    output NUMERIC(14,4),
    rated_speed NUMERIC(12,3),
    number_of_poles INTEGER,

    -- Construcción / diseño
    design TEXT,
    enclosure TEXT,
    degree_of_protection TEXT,
    frame TEXT,
    mounting TEXT,
    insulation_class TEXT,
    duty_cycle TEXT,

    -- Deslizamiento y torque
    slip NUMERIC(12,5),
    rated_torque NUMERIC(14,4),
    locked_rotor_torque NUMERIC(14,4),
    breakdown_torque NUMERIC(14,4),

    -- Arranque
    starting_method TEXT,
    l_r_amperes TEXT,
    lrc TEXT,
    no_load_current TEXT,
    locked_rotor_time TEXT,

    -- Rotación
    rotation TEXT,

    -- Inercia
    moment_of_inertia NUMERIC(16,6),

    -- Condiciones ambientales
    temperature_rise NUMERIC(10,3),
    ambient_temperature NUMERIC(10,3),
    altitude NUMERIC(12,3),
    noise_level NUMERIC(10,3),

    -- Peso
    approximate_weight NUMERIC(14,3),

    -- Rodamientos
    bearing_drive_end TEXT,
    bearing_non_drive_end TEXT,
    front_bearing TEXT,
    rear_bearing TEXT,

    -- Información adicional del fabricante
    connection TEXT,
    standard TEXT,
    nema_classification TEXT,
    year_of_manufacture INTEGER,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_componente_motor_electrico_componente
    ON componente_motor_electrico(componente_id);


-- ============================================================
-- FECHAS DE COMPONENTE
-- ============================================================

ALTER TABLE componentes_equipo
    ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMPTZ;

UPDATE componentes_equipo
SET fecha_creacion = COALESCE(fecha_creacion, creado_en, NOW()),
    fecha_actualizacion = COALESCE(fecha_actualizacion, actualizado_en, creado_en, NOW())
WHERE fecha_creacion IS NULL
   OR fecha_actualizacion IS NULL;


ALTER TABLE componentes_equipo
    ALTER COLUMN fecha_creacion SET DEFAULT NOW();


-- ============================================================
-- TRIGGER:
-- fecha_actualizacion SOLO cambia cuando cambia:
-- marca, modelo o numero_serie
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_fecha_componente()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.marca IS DISTINCT FROM NEW.marca
       OR OLD.modelo IS DISTINCT FROM NEW.modelo
       OR OLD.numero_serie IS DISTINCT FROM NEW.numero_serie
    THEN
        NEW.fecha_actualizacion = NOW();
    ELSE
        NEW.fecha_actualizacion = OLD.fecha_actualizacion;
    END IF;

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS trg_actualizar_fecha_componente
ON componentes_equipo;

CREATE TRIGGER trg_actualizar_fecha_componente
BEFORE UPDATE ON componentes_equipo
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_componente();


-- ============================================================
-- INICIALIZACIÓN DE TIPO
-- No usamos CHECK para permitir nuevos tipos sin modificar
-- esta migración posteriormente.
-- ============================================================

UPDATE componentes_equipo
SET tipo_componente = 'GENERAL'
WHERE tipo_componente IS NULL;


COMMIT;