// src/shared/types/piTag.ts
// Tipos REALES según backend confirmado (tabla tags_descubiertos).
// Nota: hoy el backend solo soporta asignación a equipo_id.
// componente_id y repuesto_id están tipados para el futuro.

export interface TagDescubierto {
  id: number;
  tag_name: string;            // ej. "MOLP-001.CURRENT"
  tag_path?: string;           // ej. "\\PEELPWVPIAP01NX\\BD El Porvenir\\MOLP-001.CURRENT"
  pi_server?: string;
  database_name?: string;
  element_name?: string;
  pi_point_name?: string;
  unidad?: string;
  equipo_id?: number | null;
  // Futuro:
  componente_id?: number | null;
  repuesto_id?: number | null;
  frecuencia?: number;
  ultima_lectura?: string;
  creado_en?: string;
}

export interface TagAgrupado {
  equipo_sugerido?: string;
  total_tags: number;
  tags: string[];
  unidades?: string[];
}

export interface AsignacionTagsEquipo {
  equipo_id: number;
  tags: string[];              // lista de tag_name o tag_path
}