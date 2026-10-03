BEGIN;

ALTER TABLE componentes_equipo
    ADD COLUMN estado_componente TEXT;

UPDATE componentes_equipo
SET estado_componente =
    CASE
        WHEN activo = TRUE THEN 'activo'
        ELSE 'inactivo'
    END;

ALTER TABLE componentes_equipo
    ALTER COLUMN estado_componente SET DEFAULT 'activo';

ALTER TABLE componentes_equipo
    ALTER COLUMN estado_componente SET NOT NULL;

ALTER TABLE componentes_equipo
    ADD CONSTRAINT chk_componentes_estado
    CHECK (
        estado_componente IN (
            'activo',
            'inactivo',
            'fallo',
            'mantenimiento'
        )
    );

COMMIT;
