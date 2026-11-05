-- ============================================================
-- Migración 040: guardias en hora Perú (America/Lima)
-- ============================================================
-- La versión anterior calculaba las guardias en UTC (7h UTC),
-- lo cual no coincide con la operación real de planta (7h Perú).
--
-- Esta migración corrige la función para que trabaje con
-- 'America/Lima' como zona horaria de referencia.
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION guardias_en_rango(
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
    v_dia_local date;
BEGIN
    IF p_desde IS NULL OR p_hasta IS NULL OR p_hasta <= p_desde THEN
        RETURN;
    END IF;

    v_cursor := ((p_desde AT TIME ZONE v_tz)::date - INTERVAL '1 day')::date;
    v_fin_iter := p_hasta + INTERVAL '1 day';

    WHILE (v_cursor AT TIME ZONE v_tz) < v_fin_iter LOOP
        v_dia_local := (v_cursor AT TIME ZONE v_tz)::date;

        v_dia_inicio := ((v_dia_local::timestamp + INTERVAL '7 hours') AT TIME ZONE v_tz);
        v_dia_fin    := ((v_dia_local::timestamp + INTERVAL '19 hours') AT TIME ZONE v_tz);

        IF v_dia_fin > p_desde AND v_dia_inicio < p_hasta THEN
            guardia_inicio := GREATEST(v_dia_inicio, p_desde);
            guardia_fin    := LEAST(v_dia_fin, p_hasta);
            tipo           := 'dia';
            fecha_ref      := v_dia_local;
            RETURN NEXT;
        END IF;

        v_noche_ini := ((v_dia_local::timestamp + INTERVAL '19 hours') AT TIME ZONE v_tz);
        v_noche_fin := ((v_dia_local::timestamp + INTERVAL '31 hours') AT TIME ZONE v_tz);

        IF v_noche_fin > p_desde AND v_noche_ini < p_hasta THEN
            guardia_inicio := GREATEST(v_noche_ini, p_desde);
            guardia_fin    := LEAST(v_noche_fin, p_hasta);
            tipo           := 'noche';
            fecha_ref      := v_dia_local;
            RETURN NEXT;
        END IF;

        v_cursor := v_cursor + INTERVAL '1 day';
    END LOOP;

    RETURN;
END;
$$;

COMMIT;