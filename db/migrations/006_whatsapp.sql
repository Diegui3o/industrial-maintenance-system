-- =====================================================
-- CREACIÓN DE TABLAS PARA WHATSAPP MULTI-INSTANCIA
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_instancias (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    telefono TEXT UNIQUE,
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'conectado', 'desconectado', 'error')),
    ruta_sesion TEXT NOT NULL UNIQUE,
    usuario_id INT REFERENCES usuarios(id),
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

-- =====================================================
-- INSERT DE INSTANCIA PARA EL ADMINISTRADOR
-- =====================================================
INSERT INTO whatsapp_instancias (nombre, telefono, estado, ruta_sesion, usuario_id)
VALUES ('Bot Administrador', NULL, 'pendiente', 'session_admin.db', 1)
ON CONFLICT (usuario_id) DO NOTHING;

-- Actualizar cualquier instancia sin usuario_id asignado
UPDATE whatsapp_instancias
SET usuario_id = 1
WHERE usuario_id IS NULL;