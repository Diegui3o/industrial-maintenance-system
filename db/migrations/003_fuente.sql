-- Configuración de umbrales por equipo
CREATE TABLE config_umbrales (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    parametro TEXT NOT NULL,        -- temperatura, vibracion, presion, ping
    umbral_min NUMERIC,
    umbral_max NUMERIC,
    unidad TEXT,                    -- °C, mm/s, PSI, ms
    severidad TEXT DEFAULT 'alta',  -- baja, media, alta, critica
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

-- Configuración de fuentes de datos por equipo
CREATE TABLE config_fuentes (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    tipo_fuente TEXT NOT NULL,      -- ping, pisystem, mqtt, modbus
    endpoint TEXT,                  -- IP, URL, tópico MQTT
    intervalo_segundos INT DEFAULT 60,
    timeout_segundos INT DEFAULT 10,
    reintentos INT DEFAULT 3,
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de valores recibidos (histórico para análisis)
CREATE TABLE datos_sensores (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    parametro TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    unidad TEXT,
    fuente TEXT,
    recibido_en TIMESTAMPTZ DEFAULT NOW()
);

-- Cola de notificaciones
CREATE TABLE cola_notificaciones (
    id SERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,             -- whatsapp, email, push
    destinatario TEXT NOT NULL,     -- número, email, token
    mensaje TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente', -- pendiente, enviado, fallo
    intentos INT DEFAULT 0,
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    enviado_en TIMESTAMPTZ
);

-- Grupos de notificación
CREATE TABLE grupos_notificacion (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,           -- "Mecánicos", "Supervisores"
    tipo TEXT NOT NULL,             -- whatsapp, email
    destinatario TEXT NOT NULL,     -- ID del grupo de WhatsApp o lista de emails
    activo BOOLEAN DEFAULT TRUE
);

-- Relación equipo-grupo (qué grupos reciben alertas de qué equipos)
CREATE TABLE equipo_grupo (
    id SERIAL PRIMARY KEY,
    equipo_id INT NOT NULL REFERENCES equipos(id),
    grupo_id INT NOT NULL REFERENCES grupos_notificacion(id),
    UNIQUE(equipo_id, grupo_id)
);
