-- Migración 033 (aditiva, no toca repuestos)
CREATE TABLE IF NOT EXISTS repuestos_historial (
    id              BIGSERIAL PRIMARY KEY,
    repuesto_id     INTEGER NOT NULL REFERENCES repuestos(id) ON DELETE CASCADE,
    campo           TEXT    NOT NULL,           -- 'activo', 'stock_actual', 'modelo', etc.
    valor_anterior  TEXT,                       -- NULL si era nuevo
    valor_nuevo     TEXT,                       -- NULL si se borró (no aplica aquí)
    tipo_origen     TEXT    NOT NULL CHECK (tipo_origen IN ('MANUAL','PI_SYSTEM','OTRO')),
    usuario_id      INTEGER,                    -- NULL si es PI_SYSTEM
    conector_id     TEXT,                       -- ej. 'pi-connector-fallas'
    comentario      TEXT,
    creado_en       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_repuestos_historial_repuesto ON repuestos_historial(repuesto_id, creado_en DESC);