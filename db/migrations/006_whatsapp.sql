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
    usuario_id INT UNIQUE REFERENCES usuarios(id),
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
-- No se asume que el administrador tenga id = 1.
-- Se obtiene su ID mediante el username estable "admin".

INSERT INTO whatsapp_instancias (
    nombre,
    telefono,
    estado,
    ruta_sesion,
    usuario_id
)
SELECT
    'Bot Administrador',
    NULL,
    'pendiente',
    'session_admin.db',
    u.id
FROM usuarios u
WHERE u.username = 'admin'
ON CONFLICT (usuario_id) DO NOTHING;

-- =====================================================
-- ASIGNAR ADMINISTRADOR A INSTANCIAS SIN USUARIO
-- =====================================================
-- Solo se ejecuta si existe el usuario administrador.

UPDATE whatsapp_instancias wi
SET usuario_id = u.id,
    actualizado_en = NOW()
FROM usuarios u
WHERE u.username = 'admin'
  AND wi.usuario_id IS NULL;