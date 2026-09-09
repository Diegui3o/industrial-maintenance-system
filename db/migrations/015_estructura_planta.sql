BEGIN;

-- ============================================================
-- PROCESOS
-- ============================================================

CREATE TABLE IF NOT EXISTS procesos_planta (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

-- ============================================================
-- SUBPROCESOS
-- ============================================================

CREATE TABLE IF NOT EXISTS subprocesos_planta (
    id SERIAL PRIMARY KEY,
    proceso_id INT NOT NULL
        REFERENCES procesos_planta(id)
        ON DELETE RESTRICT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,

    CONSTRAINT uq_subproceso_proceso_nombre
        UNIQUE (proceso_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_subprocesos_proceso
    ON subprocesos_planta(proceso_id);

-- ============================================================
-- EQUIPOS DENTRO DE LA ESTRUCTURA DE PLANTA
-- ============================================================

CREATE TABLE IF NOT EXISTS planta_equipos (
    equipo_id INT PRIMARY KEY
        REFERENCES equipos(id)
        ON DELETE CASCADE,

    subproceso_id INT NOT NULL
        REFERENCES subprocesos_planta(id)
        ON DELETE RESTRICT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_planta_equipos_subproceso
    ON planta_equipos(subproceso_id);

-- ============================================================
-- CLASIFICACIONES DE PLANTA
-- Ejemplo futuro:
-- Planta Mecánica
-- Planta Instrumental
-- Planta Eléctrica
-- Sistemas
-- ============================================================

CREATE TABLE IF NOT EXISTS clasificaciones_planta (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

-- ============================================================
-- EQUIPO ↔ CLASIFICACIÓN
-- Un equipo puede pertenecer a varias clasificaciones.
-- ============================================================

CREATE TABLE IF NOT EXISTS equipo_clasificacion_planta (
    equipo_id INT NOT NULL
        REFERENCES equipos(id)
        ON DELETE CASCADE,

    clasificacion_id INT NOT NULL
        REFERENCES clasificaciones_planta(id)
        ON DELETE CASCADE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (equipo_id, clasificacion_id)
);

CREATE INDEX IF NOT EXISTS idx_equipo_clasificacion_equipo
    ON equipo_clasificacion_planta(equipo_id);

CREATE INDEX IF NOT EXISTS idx_equipo_clasificacion_clasificacion
    ON equipo_clasificacion_planta(clasificacion_id);

-- ============================================================
-- SISTEMAS
-- Ejemplo futuro:
-- Sistema de Bombeo
-- Sistema de Ventilación
-- Sistema de Agua
-- ============================================================

CREATE TABLE IF NOT EXISTS sistemas_planta (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

-- ============================================================
-- EQUIPO ↔ SISTEMA
-- Un equipo puede pertenecer a varios sistemas.
-- ============================================================

CREATE TABLE IF NOT EXISTS equipo_sistema_planta (
    equipo_id INT NOT NULL
        REFERENCES equipos(id)
        ON DELETE CASCADE,

    sistema_id INT NOT NULL
        REFERENCES sistemas_planta(id)
        ON DELETE CASCADE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (equipo_id, sistema_id)
);

CREATE INDEX IF NOT EXISTS idx_equipo_sistema_equipo
    ON equipo_sistema_planta(equipo_id);

CREATE INDEX IF NOT EXISTS idx_equipo_sistema_sistema
    ON equipo_sistema_planta(sistema_id);

-- ============================================================
-- COMPONENTES
-- ============================================================

CREATE TABLE IF NOT EXISTS componentes_equipo (
    id SERIAL PRIMARY KEY,

    equipo_id INT NOT NULL
        REFERENCES equipos(id)
        ON DELETE CASCADE,

    codigo TEXT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,

    CONSTRAINT uq_componente_equipo_nombre
        UNIQUE (equipo_id, nombre)
);

CREATE INDEX IF NOT EXISTS idx_componentes_equipo
    ON componentes_equipo(equipo_id);

-- ============================================================
-- REPUESTOS
-- Catálogo reutilizable de repuestos.
-- ============================================================

CREATE TABLE IF NOT EXISTS repuestos (
    id SERIAL PRIMARY KEY,

    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

-- ============================================================
-- COMPONENTE ↔ REPUESTO
-- ============================================================

CREATE TABLE IF NOT EXISTS componente_repuesto (
    componente_id INT NOT NULL
        REFERENCES componentes_equipo(id)
        ON DELETE CASCADE,

    repuesto_id INT NOT NULL
        REFERENCES repuestos(id)
        ON DELETE RESTRICT,

    cantidad NUMERIC(12,3) DEFAULT 1,
    posicion TEXT,
    notas TEXT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ,

    PRIMARY KEY (componente_id, repuesto_id)
);

CREATE INDEX IF NOT EXISTS idx_componente_repuesto_componente
    ON componente_repuesto(componente_id);

CREATE INDEX IF NOT EXISTS idx_componente_repuesto_repuesto
    ON componente_repuesto(repuesto_id);

COMMIT;