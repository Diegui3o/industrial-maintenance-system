CREATE TABLE mantenimiento (
    id SERIAL PRIMARY KEY,

    equipo_id INT NOT NULL REFERENCES equipos(id),
    usuario_id INT REFERENCES usuarios(id),

    fecha_reporte DATE NOT NULL DEFAULT CURRENT_DATE,
    fase TEXT NOT NULL,
    taller TEXT NOT NULL,
    tipo_criticidad TEXT,
    sistema TEXT,
    inicio_parada TIMESTAMPTZ,
    fin_parada TIMESTAMPTZ,
    horas NUMERIC(6,2),
    tipo_intervencion TEXT NOT NULL,
    modo_falla TEXT,
    consecuencia_inmediata TEXT,
    descripcion_evento TEXT,
    stand_by BOOLEAN DEFAULT false,
    produccion_afectada BOOLEAN DEFAULT false,
    tn_dejadas_procesar NUMERIC(10,2),
    enlace TEXT,

    estado_falla VARCHAR(20) DEFAULT 'abierta'
        CHECK (estado_falla IN ('abierta','en_proceso','cerrada')),
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

CREATE INDEX idx_mant_fecha ON mantenimiento(fecha_reporte);
CREATE INDEX idx_mant_fase ON mantenimiento(fase);
CREATE INDEX idx_mant_taller ON mantenimiento(taller);
CREATE INDEX idx_mant_equipo ON mantenimiento(equipo_id);
CREATE INDEX idx_mant_estado ON mantenimiento(estado_falla);