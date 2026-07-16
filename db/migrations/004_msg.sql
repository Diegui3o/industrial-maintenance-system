-- Eliminar tablas viejas si existen
DROP TABLE IF EXISTS equipo_grupo CASCADE;
DROP TABLE IF EXISTS grupos_whatsapp CASCADE;
DROP TABLE IF EXISTS cola_notificaciones CASCADE;
DROP TABLE IF EXISTS reglas_notificacion CASCADE;
DROP TABLE IF EXISTS destinatarios CASCADE;
DROP TABLE IF EXISTS grupos_notificacion CASCADE;
DROP TABLE IF EXISTS plantillas_notificacion CASCADE;

-- ============================================
-- PLANTILLAS DE MENSAJES (personalizables)
-- ============================================
CREATE TABLE plantillas_notificacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,              -- "alerta_fallo", "alerta_recuperacion"
    canal TEXT NOT NULL,                      -- whatsapp, email, push
    asunto TEXT,                              -- Para email: "ALERTA: {{.EquipoNombre}} en fallo"
    cuerpo TEXT NOT NULL,                     -- Cuerpo del mensaje con variables {{.}}
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GRUPOS DE NOTIFICACIÓN (genérico para todos los canales)
-- ============================================
CREATE TABLE grupos_notificacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,                     -- "Mecánicos Planta", "Supervisores"
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DESTINATARIOS (miembros del grupo con su canal)
-- ============================================
CREATE TABLE destinatarios (
    id SERIAL PRIMARY KEY,
    grupo_id INT NOT NULL REFERENCES grupos_notificacion(id),
    nombre TEXT NOT NULL,
    canal TEXT NOT NULL,                      -- whatsapp, email, push
    destino TEXT NOT NULL,                    -- número WhatsApp, email, token Firebase
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REGLAS DE NOTIFICACIÓN (qué grupo recibe qué tipo de evento)
-- ============================================
CREATE TABLE reglas_notificacion (
    id SERIAL PRIMARY KEY,
    equipo_id INT REFERENCES equipos(id),     -- NULL = aplica a todos
    area TEXT,                                -- NULL = todas las áreas, "molienda" = solo esa
    severidad TEXT NOT NULL,                  -- baja, media, alta, critica
    tipo_evento TEXT NOT NULL,                -- fallo, recuperacion, mantenimiento
    grupo_id INT NOT NULL REFERENCES grupos_notificacion(id),
    plantilla_id INT NOT NULL REFERENCES plantillas_notificacion(id),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COLA DE NOTIFICACIONES (historial de envíos)
-- ============================================
CREATE TABLE cola_notificaciones (
    id SERIAL PRIMARY KEY,
    regla_id INT REFERENCES reglas_notificacion(id),
    destinatario_id INT REFERENCES destinatarios(id),
    canal TEXT NOT NULL,
    destino TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente',          -- pendiente, enviado, fallo, cancelado
    intentos INT DEFAULT 0,
    error TEXT,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    enviado_en TIMESTAMPTZ
);