BEGIN;

-- Permitir subprocesos sin proceso padre
ALTER TABLE subprocesos_planta
    ALTER COLUMN proceso_id DROP NOT NULL;

-- Reemplazar la FK actual por SET NULL
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t
            ON t.oid = c.conrelid
        JOIN pg_class rt
            ON rt.oid = c.confrelid
        WHERE t.relname = 'subprocesos_planta'
          AND rt.relname = 'procesos_planta'
          AND c.contype = 'f'
    LOOP
        EXECUTE format(
            'ALTER TABLE subprocesos_planta DROP CONSTRAINT IF EXISTS %I',
            r.conname
        );
    END LOOP;
END $$;

ALTER TABLE subprocesos_planta
    ADD CONSTRAINT fk_subprocesos_proceso
    FOREIGN KEY (proceso_id)
    REFERENCES procesos_planta(id)
    ON DELETE SET NULL;

COMMIT;
