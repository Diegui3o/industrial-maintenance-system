-- ============================================================
-- Migración 031: Activos polimórficos (equipo / componente / repuesto)
-- ============================================================
-- Objetivo:
--   Permitir que un tag de PI pueda asignarse a un equipo, a un
--   componente o a un repuesto (o a los tres a la vez), manteniendo
--   compatibilidad total con la columna equipo_id existente.
--
-- Filosofía:
--   * NO se elimina equipo_id. Se mantiene por compatibilidad.
--   * componente_id y repuesto_id son nuevos y nullable.
--   * config_umbrales recibe tag_id nullable, pero el umbral sigue
--     rigiendo por tag (un tag = un umbral) cuando tag_id está relleno.
--   * Todo idempotente. Se puede ejecutar varias veces sin daño.
--
-- Rollback: ver al final del archivo.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. tags_descubiertos: añadir componente_id y repuesto_id
-- ------------------------------------------------------------
ALTER TABLE tags_descubiertos
    ADD COLUMN IF NOT EXISTS componente_id int;

ALTER TABLE tags_descubiertos
    ADD COLUMN IF NOT EXISTS repuesto_id int;

-- FK suaves (ON DELETE SET NULL para no bloquear borrados futuros)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'tags_descubiertos_componente_id_fkey'
    ) THEN
        ALTER TABLE tags_descubiertos
            ADD CONSTRAINT tags_descubiertos_componente_id_fkey
            FOREIGN KEY (componente_id)
            REFERENCES componentes_equipo(id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'tags_descubiertos_repuesto_id_fkey'
    ) THEN
        ALTER TABLE tags_descubiertos
            ADD CONSTRAINT tags_descubiertos_repuesto_id_fkey
            FOREIGN KEY (repuesto_id)
            REFERENCES repuestos(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Índices para acelerar búsquedas por activo
CREATE INDEX IF NOT EXISTS idx_tags_descubiertos_componente
    ON tags_descubiertos(componente_id)
    WHERE componente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tags_descubiertos_repuesto
    ON tags_descubiertos(repuesto_id)
    WHERE repuesto_id IS NOT NULL;

-- ------------------------------------------------------------
-- 2. config_umbrales: añadir tag_id, componente_id, repuesto_id
-- ------------------------------------------------------------
ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS tag_id int;

ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS componente_id int;

ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS repuesto_id int;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'config_umbrales_tag_id_fkey'
    ) THEN
        ALTER TABLE config_umbrales
            ADD CONSTRAINT config_umbrales_tag_id_fkey
            FOREIGN KEY (tag_id)
            REFERENCES tags_descubiertos(id)
            ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'config_umbrales_componente_id_fkey'
    ) THEN
        ALTER TABLE config_umbrales
            ADD CONSTRAINT config_umbrales_componente_id_fkey
            FOREIGN KEY (componente_id)
            REFERENCES componentes_equipo(id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'config_umbrales_repuesto_id_fkey'
    ) THEN
        ALTER TABLE config_umbrales
            ADD CONSTRAINT config_umbrales_repuesto_id_fkey
            FOREIGN KEY (repuesto_id)
            REFERENCES repuestos(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Índice único parcial: un tag no puede tener dos umbrales para el
-- mismo parámetro. Solo aplica cuando tag_id IS NOT NULL, para no
-- romper filas históricas que aún no tienen tag_id.
CREATE UNIQUE INDEX IF NOT EXISTS uq_config_umbrales_tag_parametro
    ON config_umbrales(tag_id, parametro)
    WHERE tag_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_config_umbrales_componente
    ON config_umbrales(componente_id)
    WHERE componente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_config_umbrales_repuesto
    ON config_umbrales(repuesto_id)
    WHERE repuesto_id IS NOT NULL;

-- ------------------------------------------------------------
-- 3. alarmas: añadir componente_id, repuesto_id
--    + tag_id y parametro para trazabilidad y deduplicación
-- ------------------------------------------------------------
ALTER TABLE alarmas
    ADD COLUMN IF NOT EXISTS componente_id int;

ALTER TABLE alarmas
    ADD COLUMN IF NOT EXISTS repuesto_id int;

ALTER TABLE alarmas
    ADD COLUMN IF NOT EXISTS tag_id int;

ALTER TABLE alarmas
    ADD COLUMN IF NOT EXISTS parametro text;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'alarmas_componente_id_fkey'
    ) THEN
        ALTER TABLE alarmas
            ADD CONSTRAINT alarmas_componente_id_fkey
            FOREIGN KEY (componente_id)
            REFERENCES componentes_equipo(id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'alarmas_repuesto_id_fkey'
    ) THEN
        ALTER TABLE alarmas
            ADD CONSTRAINT alarmas_repuesto_id_fkey
            FOREIGN KEY (repuesto_id)
            REFERENCES repuestos(id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'alarmas_tag_id_fkey'
    ) THEN
        ALTER TABLE alarmas
            ADD CONSTRAINT alarmas_tag_id_fkey
            FOREIGN KEY (tag_id)
            REFERENCES tags_descubiertos(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Índice único parcial: una sola alarma activa por
-- (equipo, componente, repuesto, parametro).
-- Usa COALESCE para tratar NULL como 0 y así deduplicar correctamente.
CREATE UNIQUE INDEX IF NOT EXISTS uq_alarmas_activa_por_activo_parametro
    ON alarmas(
        COALESCE(equipo_id, 0),
        COALESCE(componente_id, 0),
        COALESCE(repuesto_id, 0),
        COALESCE(parametro, '')
    )
    WHERE estado = 'activa';

CREATE INDEX IF NOT EXISTS idx_alarmas_componente
    ON alarmas(componente_id)
    WHERE componente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_alarmas_repuesto
    ON alarmas(repuesto_id)
    WHERE repuesto_id IS NOT NULL;

-- ------------------------------------------------------------
-- 4. eventos_estado: añadir componente_id, repuesto_id
--    + índices únicos parciales para no duplicar eventos abiertos
-- ------------------------------------------------------------
ALTER TABLE eventos_estado
    ADD COLUMN IF NOT EXISTS componente_id int;

ALTER TABLE eventos_estado
    ADD COLUMN IF NOT EXISTS repuesto_id int;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'eventos_estado_componente_id_fkey'
    ) THEN
        ALTER TABLE eventos_estado
            ADD CONSTRAINT eventos_estado_componente_id_fkey
            FOREIGN KEY (componente_id)
            REFERENCES componentes_equipo(id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'eventos_estado_repuesto_id_fkey'
    ) THEN
        ALTER TABLE eventos_estado
            ADD CONSTRAINT eventos_estado_repuesto_id_fkey
            FOREIGN KEY (repuesto_id)
            REFERENCES repuestos(id)
            ON DELETE SET NULL;
    END IF;
END $$;

-- Un evento abierto por activo (equipo, componente o repuesto)
CREATE UNIQUE INDEX IF NOT EXISTS uq_evento_abierto_componente
    ON eventos_estado(componente_id)
    WHERE fecha_fin IS NULL AND componente_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_evento_abierto_repuesto
    ON eventos_estado(repuesto_id)
    WHERE fecha_fin IS NULL AND repuesto_id IS NOT NULL;

-- ------------------------------------------------------------
-- 5. datos_eventos: añadir componente_id, repuesto_id, tag_id
-- ------------------------------------------------------------
ALTER TABLE datos_eventos
    ADD COLUMN IF NOT EXISTS componente_id int;

ALTER TABLE datos_eventos
    ADD COLUMN IF NOT EXISTS repuesto_id int;

ALTER TABLE datos_eventos
    ADD COLUMN IF NOT EXISTS tag_id int;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'datos_eventos_componente_id_fkey'
    ) THEN
        ALTER TABLE datos_eventos
            ADD CONSTRAINT datos_eventos_componente_id_fkey
            FOREIGN KEY (componente_id)
            REFERENCES componentes_equipo(id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'datos_eventos_repuesto_id_fkey'
    ) THEN
        ALTER TABLE datos_eventos
            ADD CONSTRAINT datos_eventos_repuesto_id_fkey
            FOREIGN KEY (repuesto_id)
            REFERENCES repuestos(id)
            ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'datos_eventos_tag_id_fkey'
    ) THEN
        ALTER TABLE datos_eventos
            ADD CONSTRAINT datos_eventos_tag_id_fkey
            FOREIGN KEY (tag_id)
            REFERENCES tags_descubiertos(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_datos_eventos_componente
    ON datos_eventos(componente_id)
    WHERE componente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_datos_eventos_repuesto
    ON datos_eventos(repuesto_id)
    WHERE repuesto_id IS NOT NULL;

-- ------------------------------------------------------------
-- 6. Backfill tag_id en config_umbrales
--    Solo para filas existentes que ya apuntan a un equipo.
--    Emparejamos por (equipo_id, parametro) con tags_descubiertos.
--    Si hay varios tags para el mismo equipo+parametro, tomamos el
--    más reciente por id y lo asignamos al umbral.
--    Idempotente: si ya tiene tag_id, no lo toca.
-- ------------------------------------------------------------
UPDATE config_umbrales cu
SET tag_id = td.id
FROM tags_descubiertos td
WHERE cu.tag_id IS NULL
  AND cu.equipo_id = td.equipo_id
  AND lower(trim(cu.parametro)) = lower(trim(td.tag_name))
  AND td.id = (
      SELECT MIN(td2.id)
      FROM tags_descubiertos td2
      WHERE td2.equipo_id = cu.equipo_id
        AND lower(trim(td2.tag_name)) = lower(trim(cu.parametro))
  );

COMMIT;

-- ============================================================
-- VERIFICACIÓN POST-MIGRACIÓN (ejecutar aparte, no forma parte de la migración)
-- ============================================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name IN ('tags_descubiertos','config_umbrales','alarmas','eventos_estado','datos_eventos')
--   AND column_name IN ('componente_id','repuesto_id','tag_id','parametro')
-- ORDER BY table_name, column_name;
--
-- SELECT id, equipo_id, tag_id, parametro, umbral_min, umbral_max FROM config_umbrales;
--
-- SELECT COUNT(*) FROM alarmas;
-- SELECT COUNT(*) FROM datos_eventos;
-- SELECT COUNT(*) FROM eventos_estado;

-- ============================================================
-- ROLLBACK (si fuese necesario revertir)
-- ============================================================
-- BEGIN;
-- DROP INDEX IF EXISTS uq_alarmas_activa_por_activo_parametro;
-- DROP INDEX IF EXISTS uq_evento_abierto_componente;
-- DROP INDEX IF EXISTS uq_evento_abierto_repuesto;
-- DROP INDEX IF EXISTS uq_config_umbrales_tag_parametro;
-- DROP INDEX IF EXISTS idx_tags_descubiertos_componente;
-- DROP INDEX IF EXISTS idx_tags_descubiertos_repuesto;
-- DROP INDEX IF EXISTS idx_config_umbrales_componente;
-- DROP INDEX IF EXISTS idx_config_umbrales_repuesto;
-- DROP INDEX IF EXISTS idx_alarmas_componente;
-- DROP INDEX IF EXISTS idx_alarmas_repuesto;
-- DROP INDEX IF EXISTS idx_datos_eventos_componente;
-- DROP INDEX IF EXISTS idx_datos_eventos_repuesto;
--
-- ALTER TABLE tags_descubiertos
--   DROP CONSTRAINT IF EXISTS tags_descubiertos_componente_id_fkey,
--   DROP CONSTRAINT IF EXISTS tags_descubiertos_repuesto_id_fkey,
--   DROP COLUMN IF EXISTS componente_id,
--   DROP COLUMN IF EXISTS repuesto_id;
--
-- ALTER TABLE config_umbrales
--   DROP CONSTRAINT IF EXISTS config_umbrales_tag_id_fkey,
--   DROP CONSTRAINT IF EXISTS config_umbrales_componente_id_fkey,
--   DROP CONSTRAINT IF EXISTS config_umbrales_repuesto_id_fkey,
--   DROP COLUMN IF EXISTS tag_id,
--   DROP COLUMN IF EXISTS componente_id,
--   DROP COLUMN IF EXISTS repuesto_id;
--
-- ALTER TABLE alarmas
--   DROP CONSTRAINT IF EXISTS alarmas_componente_id_fkey,
--   DROP CONSTRAINT IF EXISTS alarmas_repuesto_id_fkey,
--   DROP CONSTRAINT IF EXISTS alarmas_tag_id_fkey,
--   DROP COLUMN IF EXISTS componente_id,
--   DROP COLUMN IF EXISTS repuesto_id,
--   DROP COLUMN IF EXISTS tag_id,
--   DROP COLUMN IF EXISTS parametro;
--
-- ALTER TABLE eventos_estado
--   DROP CONSTRAINT IF EXISTS eventos_estado_componente_id_fkey,
--   DROP CONSTRAINT IF EXISTS eventos_estado_repuesto_id_fkey,
--   DROP COLUMN IF EXISTS componente_id,
--   DROP COLUMN IF EXISTS repuesto_id;
--
-- ALTER TABLE datos_eventos
--   DROP CONSTRAINT IF EXISTS datos_eventos_componente_id_fkey,
--   DROP CONSTRAINT IF EXISTS datos_eventos_repuesto_id_fkey,
--   DROP CONSTRAINT IF EXISTS datos_eventos_tag_id_fkey,
--   DROP COLUMN IF EXISTS componente_id,
--   DROP COLUMN IF EXISTS repuesto_id,
--   DROP COLUMN IF EXISTS tag_id;
-- COMMIT;