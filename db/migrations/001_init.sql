CREATE TABLE equipos (
    id SERIAL PRIMARY KEY,

    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,

    area TEXT,
    tipo TEXT,

    fase TEXT,
    fabricante TEXT,
    modelo TEXT,
    numero_serie TEXT,

    critico BOOLEAN DEFAULT false,

    estado_equipo VARCHAR(20) DEFAULT 'activo' NOT NULL CHECK (
        estado_equipo IN ('activo', 'inactivo', 'fallo', 'mantenimiento')
    ),

    fecha_instalacion DATE,

    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,

    nombre TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,

    area TEXT,

    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mantenimiento (
    id SERIAL PRIMARY KEY,

    numero_falla TEXT UNIQUE NOT NULL,

    equipo_id INT NOT NULL,
    usuario_id INT,

    tipo_mantenimiento TEXT NOT NULL CHECK (
        tipo_mantenimiento IN (
            'correctivo',
            'preventivo',
            'emergencia'
        )
    ),

    accion TEXT,
    observacion TEXT,

    estado_falla VARCHAR(20) CHECK (
        estado_falla IN (
            'abierta',
            'en_proceso',
            'cerrada'
        )
    ),

    fecha_inicio TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMPTZ,

    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMPTZ,

    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

CREATE TABLE eventos_estado (
    id SERIAL PRIMARY KEY,

    equipo_id INT NOT NULL,

    estado VARCHAR(20) NOT NULL CHECK (
        estado IN (
            'activo',
            'inactivo',
            'fallo',
            'mantenimiento'
        )
    ),

    motivo TEXT,

    fecha_inicio TIMESTAMPTZ NOT NULL,
    fecha_fin TIMESTAMPTZ,

    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE dispositivos_red (
    id SERIAL PRIMARY KEY,

    equipo_id INT NOT NULL,

    tipo_dispositivo TEXT,
    ip TEXT,
    puerto INT,
    protocolo TEXT,

    usuario TEXT,
    password_hash TEXT,

    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE alarmas (
    id SERIAL PRIMARY KEY,

    equipo_id INT NOT NULL,

    tipo TEXT,
    mensaje TEXT,

    severidad VARCHAR(20) CHECK (
        severidad IN (
            'baja',
            'media',
            'alta',
            'critica'
        )
    ),

    estado VARCHAR(20) CHECK (
        estado IN (
            'activa',
            'atendida',
            'cerrada'
        )
    ),

    fecha_generada TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMPTZ,

    FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE auditoria(
    id SERIAL PRIMARY KEY,
    usuario_id INT,
    tabla TEXT NOT NULL,
    accion TEXT NOT NULL,
    detalle TEXT,
    fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_mantenimiento_equipo 
ON mantenimiento(equipo_id);

CREATE INDEX idx_eventos_equipo 
ON eventos_estado(equipo_id);

CREATE INDEX idx_alarmas_equipo 
ON alarmas(equipo_id);

CREATE UNIQUE INDEX idx_evento_abierto
ON eventos_estado (equipo_id)
WHERE fecha_fin IS NULL;