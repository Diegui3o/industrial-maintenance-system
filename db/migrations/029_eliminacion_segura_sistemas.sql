ALTER TABLE subprocesos_sistema_planta
    ALTER COLUMN sistema_id DROP NOT NULL;

ALTER TABLE subprocesos_sistema_planta
    DROP CONSTRAINT IF EXISTS subprocesos_sistema_planta_sistema_id_fkey;

ALTER TABLE subprocesos_sistema_planta
    ADD CONSTRAINT subprocesos_sistema_planta_sistema_id_fkey
    FOREIGN KEY (sistema_id)
    REFERENCES sistemas_planta(id)
    ON DELETE SET NULL;
