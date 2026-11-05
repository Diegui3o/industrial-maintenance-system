-- ============================================================
-- Migración 041: añadir 'mantenimiento' al CHECK de repuestos.estado
-- ============================================================
-- Para que el endpoint unificado de cambio de estado pueda marcar
-- un repuesto en mantenimiento, igual que un equipo o componente.
-- ============================================================

BEGIN;

-- Eliminar el CHECK antiguo
ALTER TABLE repuestos DROP CONSTRAINT IF EXISTS repuestos_estado_check;

-- Añadir el nuevo CHECK que incluye 'mantenimiento'
ALTER TABLE repuestos ADD CONSTRAINT repuestos_estado_check
    CHECK (estado = ANY (ARRAY['activo','inactivo','falla','mantenimiento','planeado','obsoleto']));

COMMIT;