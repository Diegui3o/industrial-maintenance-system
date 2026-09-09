BEGIN;

-- ============================================================
-- SUBPROCESOS DE SISTEMAS
-- ============================================================

CREATE TABLE IF NOT EXISTS subprocesos_sistema_planta (
    id SERIAL PRIMARY KEY,

    sistema_id INT NOT NULL
        REFERENCES sistemas_planta(id)
        ON DELETE RESTRICT,

    nombre TEXT NOT NULL,
    descripcion TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,

    CONSTRAINT uq_subproceso_sistema_nombre
        UNIQUE (sistema_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_subprocesos_sistema_sistema
    ON subprocesos_sistema_planta(sistema_id);


-- ============================================================
-- EQUIPOS DENTRO DE SUBPROCESOS DE SISTEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS sistema_planta_equipos (
    equipo_id INT PRIMARY KEY
        REFERENCES equipos(id)
        ON DELETE CASCADE,

    subproceso_sistema_id INT NOT NULL
        REFERENCES subprocesos_sistema_planta(id)
        ON DELETE RESTRICT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sistema_planta_equipos_subproceso
    ON sistema_planta_equipos(subproceso_sistema_id);


-- ============================================================
-- SUBCOMPONENTES
-- ============================================================

CREATE TABLE IF NOT EXISTS subcomponentes_equipo (
    id SERIAL PRIMARY KEY,

    componente_id INT NOT NULL
        REFERENCES componentes_equipo(id)
        ON DELETE CASCADE,

    codigo TEXT,
    nombre TEXT NOT NULL,
    descripcion TEXT,

    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,

    CONSTRAINT uq_subcomponente_componente_nombre
        UNIQUE (componente_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_subcomponentes_componente
    ON subcomponentes_equipo(componente_id);


-- ============================================================
-- REPUESTOS LIGADOS A SUBCOMPONENTES
-- ============================================================

CREATE TABLE IF NOT EXISTS subcomponente_repuesto (
    subcomponente_id INT NOT NULL
        REFERENCES subcomponentes_equipo(id)
        ON DELETE CASCADE,

    repuesto_id INT NOT NULL
        REFERENCES repuestos(id)
        ON DELETE RESTRICT,

    cantidad NUMERIC(12,3) NOT NULL DEFAULT 1,
    posicion TEXT,
    notas TEXT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,

    PRIMARY KEY (subcomponente_id, repuesto_id)
);

CREATE INDEX IF NOT EXISTS idx_subcomponente_repuesto_subcomponente
    ON subcomponente_repuesto(subcomponente_id);

CREATE INDEX IF NOT EXISTS idx_subcomponente_repuesto_repuesto
    ON subcomponente_repuesto(repuesto_id);


-- ============================================================
-- DATOS REFERENCIALES DEL EQUIPO
-- ============================================================

ALTER TABLE equipos
    ADD COLUMN IF NOT EXISTS fase_ubicacion TEXT;

ALTER TABLE equipos
    ADD COLUMN IF NOT EXISTS area_funcional TEXT;


-- ============================================================
-- RESTRICCIÓN DE FASE
-- ============================================================

ALTER TABLE equipos
    DROP CONSTRAINT IF EXISTS chk_equipos_fase_ubicacion;

ALTER TABLE equipos
    ADD CONSTRAINT chk_equipos_fase_ubicacion
    CHECK (
        fase_ubicacion IS NULL
        OR fase_ubicacion IN (
            'FASE I',
            'FASE II',
            'FASE III',
            'MINA',
            'INFRAESTRUCTURA'
        )
    );


-- ============================================================
-- ÁREA FUNCIONAL REFERENCIAL
-- ============================================================

ALTER TABLE equipos
    DROP CONSTRAINT IF EXISTS chk_equipos_area_funcional;

ALTER TABLE equipos
    ADD CONSTRAINT chk_equipos_area_funcional
    CHECK (
        area_funcional IS NULL
        OR area_funcional IN (
            'MECANICA',
            'ELECTRICA',
            'INSTRUMENTAL'
        )
    );


COMMIT;