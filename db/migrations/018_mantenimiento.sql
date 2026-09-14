-- ============================================================
-- MANTENIMIENTO - ESTRUCTURA OPERATIVA Y ANALÍTICA
-- ============================================================

-- ------------------------------------------------------------
-- ACTIVIDADES
-- Una OT/mantenimiento puede tener varias actividades
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_actividades (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    descripcion TEXT NOT NULL,

    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (
            estado IN (
                'pendiente',
                'en_proceso',
                'terminado',
                'cancelado'
            )
        ),

    prioridad VARCHAR(20),

    horas_planificadas NUMERIC(8,2),
    horas_ejecutadas NUMERIC(8,2),

    porcentaje NUMERIC(5,2) NOT NULL DEFAULT 0
        CHECK (porcentaje >= 0 AND porcentaje <= 100),

    fecha_inicio TIMESTAMPTZ,
    fecha_fin TIMESTAMPTZ,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mant_act_mantenimiento
    ON mantenimiento_actividades(mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_mant_act_estado
    ON mantenimiento_actividades(estado);


-- ------------------------------------------------------------
-- PROGRAMACIÓN
-- Permite diferenciar preventivo/correctivo programado/no
-- programado y conservar lo planificado.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_programacion (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    tipo_programacion VARCHAR(30) NOT NULL
        CHECK (
            tipo_programacion IN (
                'preventivo',
                'correctivo_programado',
                'correctivo_no_programado'
            )
        ),

    fecha_programada DATE NOT NULL,

    semana INT,

    codigo_programa TEXT,

    ot TEXT,

    codigo_sap TEXT,

    horas_planificadas NUMERIC(8,2),

    hh_planificadas NUMERIC(10,2),

    prioridad VARCHAR(20),

    instrucciones TEXT,

    comentario TEXT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_mant_prog_mantenimiento
    ON mantenimiento_programacion(mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_mant_prog_fecha
    ON mantenimiento_programacion(fecha_programada);

CREATE INDEX IF NOT EXISTS idx_mant_prog_tipo
    ON mantenimiento_programacion(tipo_programacion);


-- ------------------------------------------------------------
-- EJECUCIÓN
-- Separa lo planificado de lo realmente ejecutado.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_ejecucion (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    fecha_inicio TIMESTAMPTZ,

    fecha_fin TIMESTAMPTZ,

    horas_ejecutadas NUMERIC(8,2),

    hh_ejecutadas NUMERIC(10,2),

    supervisor TEXT,

    descripcion_tecnica TEXT,

    desviaciones TEXT,

    petar BOOLEAN,

    equipo_detiene BOOLEAN DEFAULT FALSE,

    ejecutado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mant_ejec_mantenimiento
    ON mantenimiento_ejecucion(mantenimiento_id);


-- ------------------------------------------------------------
-- AVANCES
-- Historial real del progreso.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_avances (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    actividad_id INT
        REFERENCES mantenimiento_actividades(id)
        ON DELETE SET NULL,

    porcentaje NUMERIC(5,2) NOT NULL
        CHECK (porcentaje >= 0 AND porcentaje <= 100),

    descripcion TEXT,

    fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    usuario_id INT
        REFERENCES usuarios(id)
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_mant_avance_mantenimiento
    ON mantenimiento_avances(mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_mant_avance_fecha
    ON mantenimiento_avances(fecha);


-- ------------------------------------------------------------
-- PERSONAL
-- Una intervención puede tener varios trabajadores.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_personal (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    nombre TEXT NOT NULL,

    cargo TEXT,

    turno TEXT,

    horas NUMERIC(8,2),

    hh NUMERIC(10,2),

    fecha DATE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mant_personal_mantenimiento
    ON mantenimiento_personal(mantenimiento_id);


-- ------------------------------------------------------------
-- MATERIALES / REPUESTOS
-- Permite registrar lo utilizado sin obligar a conocer
-- inicialmente el repuesto catalogado.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_materiales (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    repuesto_id INT
        REFERENCES repuestos(id)
        ON DELETE SET NULL,

    componente_id INT
        REFERENCES componentes_equipo(id)
        ON DELETE SET NULL,

    subcomponente_id INT
        REFERENCES subcomponentes_equipo(id)
        ON DELETE SET NULL,

    descripcion TEXT,

    cantidad NUMERIC(12,3) NOT NULL DEFAULT 1,

    unidad TEXT,

    costo_unitario NUMERIC(14,2),

    costo_total NUMERIC(14,2),

    codigo_sap TEXT,

    observacion TEXT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mant_mat_mantenimiento
    ON mantenimiento_materiales(mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_mant_mat_repuesto
    ON mantenimiento_materiales(repuesto_id);

CREATE INDEX IF NOT EXISTS idx_mant_mat_componente
    ON mantenimiento_materiales(componente_id);


-- ------------------------------------------------------------
-- PARADAS / IMPACTO
-- La parada NO es tipo de mantenimiento.
-- Es impacto sobre equipo/hierarquía/proceso.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_paradas (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    nivel VARCHAR(30) NOT NULL
        CHECK (
            nivel IN (
                'ninguna',
                'equipo',
                'equipo_padre',
                'subproceso',
                'proceso'
            )
        ),

    equipo_id INT
        REFERENCES equipos(id)
        ON DELETE SET NULL,

    fecha_inicio TIMESTAMPTZ,

    fecha_fin TIMESTAMPTZ,

    horas NUMERIC(8,2),

    produccion_afectada BOOLEAN DEFAULT FALSE,

    tn_dejadas_procesar NUMERIC(12,2),

    descripcion TEXT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mant_parada_mantenimiento
    ON mantenimiento_paradas(mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_mant_parada_equipo
    ON mantenimiento_paradas(equipo_id);

CREATE INDEX IF NOT EXISTS idx_mant_parada_inicio
    ON mantenimiento_paradas(fecha_inicio);


-- ------------------------------------------------------------
-- HISTORIAL
-- Estados, reprogramaciones y cambios importantes.
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS mantenimiento_historial (
    id SERIAL PRIMARY KEY,

    mantenimiento_id INT NOT NULL
        REFERENCES mantenimiento(id)
        ON DELETE CASCADE,

    tipo_evento VARCHAR(40) NOT NULL,

    estado_anterior VARCHAR(30),

    estado_nuevo VARCHAR(30),

    fecha_anterior DATE,

    fecha_nueva DATE,

    porcentaje_anterior NUMERIC(5,2),

    porcentaje_nuevo NUMERIC(5,2),

    descripcion TEXT,

    usuario_id INT
        REFERENCES usuarios(id)
        ON DELETE SET NULL,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mant_hist_mantenimiento
    ON mantenimiento_historial(mantenimiento_id);

CREATE INDEX IF NOT EXISTS idx_mant_hist_fecha
    ON mantenimiento_historial(creado_en);

CREATE INDEX IF NOT EXISTS idx_mant_hist_tipo
    ON mantenimiento_historial(tipo_evento);


-- ------------------------------------------------------------
-- CAMPOS ANALÍTICOS EN LA CABECERA
-- ------------------------------------------------------------

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS componente_id INT
        REFERENCES componentes_equipo(id)
        ON DELETE SET NULL;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS subcomponente_id INT
        REFERENCES subcomponentes_equipo(id)
        ON DELETE SET NULL;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS prioridad VARCHAR(20);

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS causa TEXT;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS accion_realizada TEXT;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS consecuencia TEXT;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS descripcion_tecnica TEXT;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS fecha_inicio_real TIMESTAMPTZ;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS fecha_fin_real TIMESTAMPTZ;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS porcentaje_avance NUMERIC(5,2)
        DEFAULT 0
        CHECK (porcentaje_avance >= 0 AND porcentaje_avance <= 100);

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS tipo_programacion VARCHAR(30)
        CHECK (
            tipo_programacion IS NULL
            OR tipo_programacion IN (
                'preventivo',
                'correctivo_programado',
                'correctivo_no_programado'
            )
        );

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS fecha_programada DATE;

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS horas_planificadas NUMERIC(8,2);

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS hh_planificadas NUMERIC(10,2);

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS horas_ejecutadas NUMERIC(8,2);

ALTER TABLE mantenimiento
    ADD COLUMN IF NOT EXISTS hh_ejecutadas NUMERIC(10,2);

CREATE INDEX IF NOT EXISTS idx_mant_componente
    ON mantenimiento(componente_id);

CREATE INDEX IF NOT EXISTS idx_mant_subcomponente
    ON mantenimiento(subcomponente_id);

CREATE INDEX IF NOT EXISTS idx_mant_fecha_programada
    ON mantenimiento(fecha_programada);

CREATE INDEX IF NOT EXISTS idx_mant_tipo_programacion
    ON mantenimiento(tipo_programacion);