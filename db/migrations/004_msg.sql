DROP TABLE IF EXISTS equipo_grupo CASCADE;
DROP TABLE IF EXISTS grupos_whatsapp CASCADE;
DROP TABLE IF EXISTS cola_notificaciones CASCADE;
DROP TABLE IF EXISTS reglas_notificacion CASCADE;
DROP TABLE IF EXISTS destinatarios CASCADE;
DROP TABLE IF EXISTS grupos_notificacion CASCADE;
DROP TABLE IF EXISTS plantillas_notificacion CASCADE;

CREATE TABLE plantillas_notificacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    canal TEXT NOT NULL,
    asunto TEXT,
    cuerpo TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE grupos_notificacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE destinatarios (
    id SERIAL PRIMARY KEY,
    grupo_id INT NOT NULL REFERENCES grupos_notificacion(id),
    nombre TEXT NOT NULL,
    canal TEXT NOT NULL,
    destino TEXT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE reglas_notificacion (
    id SERIAL PRIMARY KEY,
    equipo_id INT REFERENCES equipos(id),
    area TEXT,
    severidad TEXT NOT NULL,
    tipo_evento TEXT NOT NULL,
    grupo_id INT NOT NULL REFERENCES grupos_notificacion(id),
    plantilla_id INT NOT NULL REFERENCES plantillas_notificacion(id),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cola_notificaciones (
    id SERIAL PRIMARY KEY,
    regla_id INT REFERENCES reglas_notificacion(id),
    destinatario_id INT REFERENCES destinatarios(id),
    canal TEXT NOT NULL,
    destino TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente',
    intentos INT DEFAULT 0,
    error TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    enviado_en TIMESTAMPTZ
);