BEGIN;

ALTER TABLE componentes_equipo
    DROP CONSTRAINT IF EXISTS uq_componente_equipo_nombre;

CREATE UNIQUE INDEX uq_componente_equipo_tipo_nombre
ON componentes_equipo (equipo_id, tipo_componente, nombre);

COMMIT;
