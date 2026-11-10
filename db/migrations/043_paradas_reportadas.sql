-- ============================================================
-- Migración 043: reporte de paradas
-- ============================================================
-- Objetivo:
--   Registrar automáticamente las paradas de equipos cuando el tag
--   asociado está en un valor <= umbral_parada durante al menos
--   min_duracion_parada_segundos.
--
--   Cada parada se registra en 'paradas_reportadas' con snapshots
--   de proceso/subproceso/componente/repuesto/tag para que el
--   reporte sea legible sin necesidad de joins.
--
--   Los campos personal_responsable, area_responsable y motivo
--   los rellena el operador (desde la pantalla o desde el Excel).
--
--   La columna sync_excel indica si la parada ya fue escrita en el
--   Excel compartido (OneDrive) para evitar duplicados.
--
-- Idempotente. No modifica datos existentes.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. config_umbrales: campos para reporte de paradas
-- ------------------------------------------------------------
ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS reportar_parada boolean DEFAULT false;

ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS umbral_parada numeric DEFAULT 0.1;

ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS min_duracion_parada_segundos int DEFAULT 1200;

-- CHECK: duración mínima positiva
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'config_umbrales_min_duracion_parada_check'
    ) THEN
        ALTER TABLE config_umbrales
            ADD CONSTRAINT config_umbrales_min_duracion_parada_check
            CHECK (min_duracion_parada_segundos IS NULL OR min_duracion_parada_segundos >= 0);
    END IF;
END $$;

-- ------------------------------------------------------------
-- 2. paradas_reportadas: tabla principal
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paradas_reportadas (
    id                       serial PRIMARY KEY,
    equipo_id                int NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    tag_id                   int REFERENCES tags_descubiertos(id) ON DELETE SET NULL,
    componente_id            int REFERENCES componentes_equipo(id) ON DELETE SET NULL,
    repuesto_id              int REFERENCES repuestos(id) ON DELETE SET NULL,

    -- Snapshots informativos (para el Excel y la UI)
    proceso_nombre           text,
    subproceso_nombre        text,
    componente_nombre        text,
    repuesto_nombre          text,
    tag_nombre               text,

    -- Tiempos
    inicio                   timestamptz NOT NULL,
    fin                      timestamptz NOT NULL,
    duracion_minutos         int NOT NULL CHECK (duracion_minutos >= 0),

    -- Campos que rellena el operador
    personal_responsable     text,
    area_responsable         text,
    motivo                   text,

    -- Sincronización con Excel compartido (OneDrive / Microsoft Graph)
    sync_excel               boolean NOT NULL DEFAULT false,
    excel_row_id             text,           -- identificador de la fila en el Excel
    sync_excel_updated_at    timestamptz,    -- última vez que se actualizó desde el Excel

    -- Auditoría
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz
);

CREATE INDEX IF NOT EXISTS idx_paradas_equipo
    ON paradas_reportadas(equipo_id);

CREATE INDEX IF NOT EXISTS idx_paradas_inicio
    ON paradas_reportadas(inicio DESC);

CREATE INDEX IF NOT EXISTS idx_paradas_sin_sync
    ON paradas_reportadas(id)
    WHERE sync_excel = false;

-- ------------------------------------------------------------
-- 3. paradas_sync_log: auditoría de cada ciclo de sincronización
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paradas_sync_log (
    id                   serial PRIMARY KEY,
    ejecutado_en         timestamptz NOT NULL DEFAULT now(),
    filas_leidas         int NOT NULL DEFAULT 0,
    filas_actualizadas   int NOT NULL DEFAULT 0,
    errores              int NOT NULL DEFAULT 0,
    mensaje              text
);

CREATE INDEX IF NOT EXISTS idx_paradas_sync_log_fecha
    ON paradas_sync_log(ejecutado_en DESC);

COMMIT;