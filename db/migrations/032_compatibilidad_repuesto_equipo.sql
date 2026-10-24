-- Migracion 032: tabla de compatibilidad explicita repuesto <-> equipo
-- No modifica tablas existentes. No inserta datos.

CREATE TABLE IF NOT EXISTS repuesto_equipo_compatible (
    repuesto_id INTEGER NOT NULL REFERENCES repuestos(id) ON DELETE CASCADE,
    equipo_id   INTEGER NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (repuesto_id, equipo_id)
);

CREATE INDEX IF NOT EXISTS idx_repuesto_equipo_compatible_equipo
    ON repuesto_equipo_compatible (equipo_id);