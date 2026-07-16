CREATE TABLE metricas_diarias(
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL,
    fecha DATE NOT NULL,
    horas_operacion NUMERIC,
    horas_fallo NUMERIC,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE metricas_diarias_detalle(
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL,
    fecha DATE NOT NULL,
    tipo_metrica TEXT NOT NULL,
    valor NUMERIC,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE INDEX idx_metricas_unica
ON metricas_diarias_detalle(equipo_id, fecha, tipo_metrica);

CREATE INDEX idx_metricas_equipo_fecha
ON metricas_diarias_detalle(equipo_id, fecha);
