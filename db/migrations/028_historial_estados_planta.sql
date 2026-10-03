CREATE TABLE historial_estados_planta (
    id BIGSERIAL PRIMARY KEY,

    entidad_tipo TEXT NOT NULL,
    entidad_id INTEGER NOT NULL,

    estado_anterior TEXT,
    estado_nuevo TEXT NOT NULL,

    fecha_cambio TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    usuario_id INTEGER,

    motivo TEXT,
    observacion TEXT
);

CREATE INDEX idx_historial_estados_entidad
ON historial_estados_planta (
    entidad_tipo,
    entidad_id,
    fecha_cambio DESC
);

CREATE INDEX idx_historial_estados_fecha
ON historial_estados_planta (
    fecha_cambio DESC
);
