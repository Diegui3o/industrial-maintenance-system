BEGIN;

ALTER TABLE componente_motor_electrico
    ADD COLUMN IF NOT EXISTS moment_of_inertia NUMERIC(16,6),
    ADD COLUMN IF NOT EXISTS temperature_rise NUMERIC(10,3),
    ADD COLUMN IF NOT EXISTS ambient_temperature TEXT,
    ADD COLUMN IF NOT EXISTS altitude NUMERIC(12,3),
    ADD COLUMN IF NOT EXISTS noise_level NUMERIC(10,3),
    ADD COLUMN IF NOT EXISTS approximate_weight NUMERIC(14,3),

    ADD COLUMN IF NOT EXISTS bearing_drive_end TEXT,
    ADD COLUMN IF NOT EXISTS bearing_non_drive_end TEXT,
    ADD COLUMN IF NOT EXISTS front_bearing TEXT,
    ADD COLUMN IF NOT EXISTS rear_bearing TEXT,

    ADD COLUMN IF NOT EXISTS connection TEXT,
    ADD COLUMN IF NOT EXISTS standard TEXT,
    ADD COLUMN IF NOT EXISTS nema_classification TEXT,
    ADD COLUMN IF NOT EXISTS year_of_manufacture INTEGER,

    ADD COLUMN IF NOT EXISTS creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ;


COMMIT;