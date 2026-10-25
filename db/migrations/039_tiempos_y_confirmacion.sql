-- ============================================================
-- Migración 039: confirmación configurable + guardias
-- ============================================================
-- Añade a config_umbrales:
--   * lecturas_confirmacion  -> cuántas lecturas seguidas para disparar
--   * hist_min / hist_max    -> histéresis de salida (opcional)
--
-- Crea función guardias_en_rango(desde, hasta) para segmentar
-- periodos de tiempo en guardias de 12 h (07-19 día, 19-07 noche).
--
-- Idempotente.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. config_umbrales: columnas nuevas
-- ------------------------------------------------------------
ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS lecturas_confirmacion int DEFAULT 3;

ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS hist_min numeric;

ALTER TABLE config_umbrales
    ADD COLUMN IF NOT EXISTS hist_max numeric;

-- CHECK: lecturas_confirmacion >= 0
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'config_umbrales_lecturas_conf_check'
    ) THEN
        ALTER TABLE config_umbrales
            ADD CONSTRAINT config_umbrales_lecturas_conf_check
            CHECK (lecturas_confirmacion IS NULL OR lecturas_confirmacion >= 0);
    END IF;
END $$;

-- ------------------------------------------------------------
-- 2. Función guardias_en_rango
-- ------------------------------------------------------------
-- Dada una ventana temporal [p_desde, p_hasta), devuelve las
-- guardias solapadas con su inicio, fin, tipo ('dia'/'noche')
-- y fecha de referencia (la fecha del turno de día).
--
-- Guardia día:   07:00 - 19:00 del mismo día
-- Guardia noche: 19:00 del día N - 07:00 del día N+1
-- ------------------------------------------------------------
 FUNCTION guardias_en_rangCREATE OR REPLACE FUNCTION guardias_en_rango(
    p_desde timestamptz,
    p_hasta timestamptz
)
RETURNS TABLE (
    guardia_inicio timestamptz,
    guardia_fin    timestamptz,
    tipo           text,
    fecha_ref      date
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_tz constant text := 'America/Lima';
    v_cursor timestamptz;
    v_dia_inicio timestamptz;
    v_dia_fin timestamptz;
    v_noche_ini timestamptz;
    v_noche_fin timestamptz;
    v_fin_iter timestamptz;
BEGIN
    IF p_desde IS NULL OR p_hasta IS NULL OR p_hasta <= p_desde THEN
        RETURN;
    END IF;

    -- Empezamos un día antes (en hora local)
    v_cursor := (date_trunc('day', p_desde AT TIME ZONE v_tz) - INTERVAL '1 day') AT TIME ZONE v_tz;
    v_fin_iter := p_hasta + INTERVAL '1 day';

    WHILE v_cursor < v_fin_iter LOOP
        -- Guardia día: 07:00 - 19:00 hora local
        v_dia_inicio := (date_trunc('day', v_cursor AT TIME ZONE v_tz) + INTERVAL '7 hours') AT TIME ZONE v_tz;
        v_dia_fin    := (date_trunc('day', v_cursor AT TIME ZONE v_tz) + INTERVAL '19 hours') AT TIME ZONE v_tz;

        IF v_dia_fin > p_desde AND v_dia_inicio < p_hasta THEN
            guardia_inicio := GREATEST(v_dia_inicio, p_desde);
            guardia_fin    := LEAST(v_dia_fin, p_hasta);
            tipo           := 'dia';
            fecha_ref      := (v_cursor AT TIME ZONE v_tz)::date;
            RETURN NEXT;
        END IF;

        -- Guardia noche: 19:00 del cursor - 07:00 del siguiente (hora local)
        v_noche_ini := (date_trunc('day', v_cursor AT TIME ZONE v_tz) + INTERVAL '19 hours') AT TIME ZONE v_tz;
        v_noche_fin := (date_trunc('day', v_cursor AT TIME ZONE v_tz) + INTERVAL '31 hours') AT TIME ZONE v_tz;

        IF v_noche_fin > p_desde AND v_noche_ini < p_hasta THEN
            guardia_inicio := GREATEST(v_noche_ini, p_desde);
            guardia_fin    := LEAST(v_noche_fin, p_hasta);
            tipo           := 'noche';
            fecha_ref      := (v_cursor AT TIME ZONE v_tz)::date;
            RETURN NEXT;
        END IF;

        v_cursor := v_cursor + INTERVAL '1 day';
    END LOOP;

    RETURN;
END;
$$;

-- ------------------------------------------------------------
-- 3. Índice auxiliar para consultas por rango
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_tiempos_activo_tag_desde
    ON tiempos_activo_sensor(tag_id, desde);

COMMIT;