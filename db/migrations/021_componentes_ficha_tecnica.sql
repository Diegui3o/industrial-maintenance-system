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
    IF OLD.equipo_id IS DISTINCT FROM NEW.equipo_id
       OR OLD.codigo IS DISTINCT FROM NEW.codigo
       OR OLD.codigo_sap IS DISTINCT FROM NEW.codigo_sap
       OR OLD.tag IS DISTINCT FROM NEW.tag
       OR OLD.nombre IS DISTINCT FROM NEW.nombre
       OR OLD.tipo_componente IS DISTINCT FROM NEW.tipo_componente
       OR OLD.marca IS DISTINCT FROM NEW.marca
       OR OLD.modelo IS DISTINCT FROM NEW.modelo
       OR OLD.numero_serie IS DISTINCT FROM NEW.numero_serie
       OR OLD.descripcion IS DISTINCT FROM NEW.descripcion
       OR OLD.activo IS DISTINCT FROM NEW.activo
    THEN
        NEW.fecha_actualizacion = NOW();
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
-- TRIGGER:
-- cualquier cambio técnico del motor actualiza
-- la fecha_actualizacion del componente padre
-- ============================================================

CREATE OR REPLACE FUNCTION actualizar_fecha_componente_motor()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.placa_motor IS DISTINCT FROM NEW.placa_motor
       OR OLD.fabricante IS DISTINCT FROM NEW.fabricante
       OR OLD.codigo_fabricante IS DISTINCT FROM NEW.codigo_fabricante
       OR OLD.producto IS DISTINCT FROM NEW.producto
       OR OLD.rated_voltage IS DISTINCT FROM NEW.rated_voltage
       OR OLD.rated_current IS DISTINCT FROM NEW.rated_current
       OR OLD.frequency IS DISTINCT FROM NEW.frequency
       OR OLD.phases IS DISTINCT FROM NEW.phases
       OR OLD.power_factor IS DISTINCT FROM NEW.power_factor
       OR OLD.efficiency IS DISTINCT FROM NEW.efficiency
       OR OLD.service_factor IS DISTINCT FROM NEW.service_factor
       OR OLD.output IS DISTINCT FROM NEW.output
       OR OLD.rated_speed IS DISTINCT FROM NEW.rated_speed
       OR OLD.number_of_poles IS DISTINCT FROM NEW.number_of_poles
       OR OLD.design IS DISTINCT FROM NEW.design
       OR OLD.enclosure IS DISTINCT FROM NEW.enclosure
       OR OLD.degree_of_protection IS DISTINCT FROM NEW.degree_of_protection
       OR OLD.frame IS DISTINCT FROM NEW.frame
       OR OLD.mounting IS DISTINCT FROM NEW.mounting
       OR OLD.insulation_class IS DISTINCT FROM NEW.insulation_class
       OR OLD.duty_cycle IS DISTINCT FROM NEW.duty_cycle
       OR OLD.slip IS DISTINCT FROM NEW.slip
       OR OLD.rated_torque IS DISTINCT FROM NEW.rated_torque
       OR OLD.locked_rotor_torque IS DISTINCT FROM NEW.locked_rotor_torque
       OR OLD.breakdown_torque IS DISTINCT FROM NEW.breakdown_torque
       OR OLD.starting_method IS DISTINCT FROM NEW.starting_method
       OR OLD.l_r_amperes IS DISTINCT FROM NEW.l_r_amperes
       OR OLD.lrc IS DISTINCT FROM NEW.lrc
       OR OLD.no_load_current IS DISTINCT FROM NEW.no_load_current
       OR OLD.locked_rotor_time IS DISTINCT FROM NEW.locked_rotor_time
       OR OLD.rotation IS DISTINCT FROM NEW.rotation
       OR OLD.moment_of_inertia IS DISTINCT FROM NEW.moment_of_inertia
       OR OLD.temperature_rise IS DISTINCT FROM NEW.temperature_rise
       OR OLD.ambient_temperature IS DISTINCT FROM NEW.ambient_temperature
       OR OLD.altitude IS DISTINCT FROM NEW.altitude
       OR OLD.noise_level IS DISTINCT FROM NEW.noise_level
       OR OLD.approximate_weight IS DISTINCT FROM NEW.approximate_weight
       OR OLD.bearing_drive_end IS DISTINCT FROM NEW.bearing_drive_end
       OR OLD.bearing_non_drive_end IS DISTINCT FROM NEW.bearing_non_drive_end
       OR OLD.front_bearing IS DISTINCT FROM NEW.front_bearing
       OR OLD.rear_bearing IS DISTINCT FROM NEW.rear_bearing
       OR OLD.connection IS DISTINCT FROM NEW.connection
       OR OLD.standard IS DISTINCT FROM NEW.standard
       OR OLD.nema_classification IS DISTINCT FROM NEW.nema_classification
       OR OLD.year_of_manufacture IS DISTINCT FROM NEW.year_of_manufacture
    THEN
        UPDATE componentes_equipo
        SET fecha_actualizacion = NOW()
        WHERE id = NEW.componente_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_actualizar_fecha_componente_motor
ON componente_motor_electrico;

CREATE TRIGGER trg_actualizar_fecha_componente_motor
AFTER UPDATE ON componente_motor_electrico
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_componente_motor();

UPDATE componentes_equipo
SET tipo_componente = 'GENERAL'
WHERE tipo_componente IS NULL;


COMMIT;