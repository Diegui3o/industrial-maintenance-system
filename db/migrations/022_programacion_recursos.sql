ALTER TABLE mantenimiento_programacion
    ADD COLUMN IF NOT EXISTS personal_planificado INT,
    ADD COLUMN IF NOT EXISTS responsable_planificado TEXT,
    ADD COLUMN IF NOT EXISTS turno_planificado TEXT;