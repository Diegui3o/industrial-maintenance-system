CREATE TABLE IF NOT EXISTS whatsapp_instancias (
    id SERIAL PRIMARY KEY,

    nombre TEXT NOT NULL,

    telefono TEXT UNIQUE,

    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (
            estado IN (
                'pendiente',
                'conectado',
                'desconectado',
                'error'
            )
        ),

    ruta_sesion TEXT NOT NULL,

    creado_en TIMESTAMPTZ DEFAULT NOW(),

    actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS grupos_whatsapp (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    jid TEXT UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    usuario_id INT REFERENCES usuarios(id),
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipo_grupo (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    grupo_id INT NOT NULL REFERENCES grupos_whatsapp(id),
    UNIQUE(equipo_id, grupo_id)
);