-- ============================================
-- 1. EXTENDER tabla equipos (sin borrar nada)
--    Todo es opcional (NULL permitido)
-- ============================================
ALTER TABLE equipos
ADD COLUMN IF NOT EXISTS activo_padre_id INT REFERENCES equipos(id),
ADD COLUMN IF NOT EXISTS nivel_jerarquia INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS tag TEXT,
ADD COLUMN IF NOT EXISTS ubicacion_fisica TEXT,
ADD COLUMN IF NOT EXISTS descripcion_larga TEXT;

-- Índice para búsqueda por padre
CREATE INDEX IF NOT EXISTS idx_equipos_padre ON equipos(activo_padre_id);

-- ============================================
-- 2. CREAR tabla conexiones (NUEVA)
--    Modela conexiones físicas/lógicas entre equipos
-- ============================================
CREATE TABLE IF NOT EXISTS conexiones (
    id SERIAL PRIMARY KEY,

    origen_id INT NOT NULL REFERENCES equipos(id),
    destino_id INT NOT NULL REFERENCES equipos(id),

    -- Tipo de conexión
    tipo_conexion TEXT NOT NULL,        -- 'fibra', 'ethernet', 'modbus', 'opcua', 'cable_poder', 'serial', 'inalambrica'

    -- Detalles técnicos
    protocolo TEXT,                     -- 'Modbus TCP', 'ProfiNet', 'EtherNet/IP', 'TCP/IP', 'RS-485'
    medio_fisico TEXT,                  -- 'Fibra Óptica MM', 'UTP Cat6', 'Coaxial RG59'

    -- Puertos/conectores en cada extremo
    puerto_origen TEXT,                 -- 'Slot 7 / Canal 1', 'Puerto SFP 2', 'Bornera 12'
    puerto_destino TEXT,

    -- Etiquetas o rótulos del cable
    etiqueta_cable TEXT,                -- 'CBL-2020-CH-001'

    -- Estado
    activo BOOLEAN DEFAULT TRUE,
    notas TEXT,

    -- Auditoría
    creado_en TIMESTAMPTZ DEFAULT NOW(),
    actualizado_en TIMESTAMPTZ
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_conexiones_origen ON conexiones(origen_id);
CREATE INDEX IF NOT EXISTS idx_conexiones_destino ON conexiones(destino_id);
CREATE INDEX IF NOT EXISTS idx_conexiones_tipo ON conexiones(tipo_conexion);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario'));
ALTER TABLE grupos_whatsapp ADD COLUMN IF NOT EXISTS usuario_id INT REFERENCES usuarios(id);

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS api_key TEXT UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT DEFAULT 'usuario';

-- Generar API Keys para usuarios existentes
UPDATE usuarios SET api_key = 'mto_' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 8) WHERE api_key IS NULL;
UPDATE usuarios SET rol = 'admin' WHERE id = 1;  -- El primer usuario es admin

-- Ver las keys generadas
SELECT id, nombre, username, rol, api_key FROM usuarios;