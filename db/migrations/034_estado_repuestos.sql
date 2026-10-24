-- db/migrations/032_estado_repuestos.sql
ALTER TABLE repuestos
ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'activo'
CHECK (estado IN ('activo', 'inactivo', 'falla', 'planeado', 'obsoleto'));