-- ============================================================
-- Migración 038: modo de umbral (alerta/fallo) + tiempos de actividad
-- ============================================================
-- Objetivo:
--   * Permitir que un umbral sea de tipo 'fallo' (comportamiento
--     actual: cambia estado + crea alarma) o 'alerta' (solo avisa,
--     no cambia estado).
--   * Preparar la contabilidad de tiempo activo/inactivo por sensor.
--
-- Idempotente. No modifica datos existentes.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. config_umbrales: modo + contar_tiempo_activo
-- ------------------------------------------------------------
ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS modo text DEFAULT 'fallo';

ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS contar_tiempo_activo boolean DEFAULT false;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'config_umbrales_modo_check'
    ) THEN
        ALTER TABLE config_umbrales
            ADD CONSTRAINT config_umbrales_modo_check
            CHECK (modo IN ('fallo', 'alerta'));
    END IF;
END $$;

-- ------------------------------------------------------------
-- 2. alertas: tabla separada para no contaminar alarmas
-- ------------------------------------------------------------
-- Las alertas son avisos que no cambian estado del activo.
-- Se guardan en una tabla paralela a 'alarmas' para que el frontend
-- pueda mostrarlas con otro color/icono y para que 'alarmas' siga
-- representando "cosas que requieren acción".
CREATE TABLE IF NOT EXISTS alertas (
    id              serial PRIMARY KEY,
    equipo_id       int REFERENCES equipos(id) ON DELETE CASCADE,
    componente_id   int REFERENCES componentes_equipo(id) ON DELETE SET NULL,
    repuesto_id     int REFERENCES repuestos(id) ON DELETE SET NULL,
    tag_id          int REFERENCES tags_descubiertos(id) ON DELETE SET NULL,
    parametro       text,
    activo_tipo     text CHECK (activo_tipo IN ('equipo','componente','repuesto')),
    mensaje         text NOT NULL,
    severidad       text NOT NULL CHECK (severidad IN ('baja','media','alta','critica')),
    estado          text NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa','vista','descartada')),
    valor_detectado numeric,
    umbral_min      numeric,
    umbral_max      numeric,
    fecha_generada  timestamptz NOT NULL DEFAULT now(),
    fecha_vista     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_alertas_estado
    ON alertas(estado)
    WHERE estado = 'activa';

CREATE INDEX IF NOT EXISTS idx_alertas_equipo
    ON alertas(equipo_id)
    WHERE equipo_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_alertas_fecha
    ON alertas(fecha_generada DESC);

-- ------------------------------------------------------------
-- 3. tiempos_activo_sensor: historial de periodos activo/inactivo
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tiempos_activo_sensor (
    id                  serial PRIMARY KEY,
    tag_id              int NOT NULL REFERENCES tags_descubiertos(id) ON DELETE CASCADE,
    activo_tipo         text CHECK (activo_tipo IN ('equipo','componente','repuesto')),
    activo_id           int,
    estado              text NOT NULL CHECK (estado IN ('activo','inactivo','sin_dato')),
    desde               timestamptz NOT NULL,
    hasta               timestamptz,
    duracion_segundos   int,
    motivo_cierre       text,     -- 'salida_rango', 'retorno_rango', 'sin_dato', 'cierre_forzado'
    valor_promedio      numeric,
    valor_min           numeric,
    valor_max           numeric
);

-- Solo un periodo abierto por (tag, activo)
CREATE UNIQUE INDEX IF NOT EXISTS uq_tiempo_abierto_por_tag_activo
    ON tiempos_activo_sensor(
        tag_id,
        COALESCE(activo_tipo, ''),
        COALESCE(activo_id, 0)
    )
    WHERE hasta IS NULL;

CREATE INDEX IF NOT EXISTS idx_tiempos_tag_activo
    ON tiempos_activo_sensor(tag_id, activo_tipo, activo_id, desde DESC);

CREATE INDEX IF NOT EXISTS idx_tiempos_rango
    ON tiempos_activo_sensor(desde, hasta);

COMMIT;