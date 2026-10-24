-- db/migrations/035_fix_equipos_constraints.sql
-- Corrige datos incompletos y anade constraints (idempotente).

BEGIN;

-- 1. Limpiar datos incompletos
UPDATE equipos SET tipo = 'SIN_DEFINIR' WHERE tipo IS NULL OR tipo = '';
UPDATE equipos SET codigo = 'PENDIENTE-' || id WHERE codigo IS NULL OR codigo = '';
UPDATE equipos SET estado_equipo = 'activo' WHERE estado_equipo IS NULL OR estado_equipo = '';
UPDATE equipos SET critico = false WHERE critico IS NULL;

-- 2. Constraints idempotentes
ALTER TABLE equipos ALTER COLUMN codigo SET NOT NULL;
ALTER TABLE equipos ALTER COLUMN nombre SET NOT NULL;
ALTER TABLE equipos ALTER COLUMN estado_equipo SET NOT NULL;
ALTER TABLE equipos ALTER COLUMN estado_equipo SET DEFAULT 'activo';
ALTER TABLE equipos ALTER COLUMN critico SET NOT NULL;
ALTER TABLE equipos ALTER COLUMN critico SET DEFAULT false;

ALTER TABLE equipos DROP CONSTRAINT IF EXISTS equipos_codigo_no_vacio;
ALTER TABLE equipos ADD CONSTRAINT equipos_codigo_no_vacio CHECK (codigo <> '');

ALTER TABLE equipos DROP CONSTRAINT IF EXISTS equipos_nombre_no_vacio;
ALTER TABLE equipos ADD CONSTRAINT equipos_nombre_no_vacio CHECK (nombre <> '');

ALTER TABLE equipos DROP CONSTRAINT IF EXISTS equipos_tipo_no_vacio;
ALTER TABLE equipos ADD CONSTRAINT equipos_tipo_no_vacio CHECK (tipo IS NULL OR tipo <> '');

COMMIT;