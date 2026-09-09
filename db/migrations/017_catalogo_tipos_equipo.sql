BEGIN;

CREATE TABLE IF NOT EXISTS tipos_equipo (
    id SERIAL PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS equipo_tipo (
    equipo_id INT NOT NULL
        REFERENCES equipos(id)
        ON DELETE CASCADE,

    tipo_equipo_id INT NOT NULL
        REFERENCES tipos_equipo(id)
        ON DELETE RESTRICT,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (equipo_id, tipo_equipo_id)
);

CREATE INDEX IF NOT EXISTS idx_equipo_tipo_tipo
    ON equipo_tipo(tipo_equipo_id);

COMMIT;