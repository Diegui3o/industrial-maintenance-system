// src/shared/types/piTag.ts
// Tipos REALES según backend confirmado (tabla tags_descubiertos).
// Nota: hoy el backend solo soporta asignación a equipo_id.

export interface TagDescubierto {
  id: number;
  tag_name: string;

  // Rutas PI System
  tag_path?: string;
  element_path?: string;         // ← NUEVO: ruta jerárquica del elemento
  pi_point_name?: string;
  pi_server?: string;
  database_name?: string;
  root_element?: string;
  element_name?: string;

  // Metadatos
  unidad?: string;
  ultimo_valor?: number | null;
  ultima_actualizacion?: string;
  frecuencia?: number;
  source?: string;
  quality?: string;

  // Asignación
  equipo_id?: number | null;
  componente_id?: number | null;
  repuesto_id?: number | null;
  asignado_automaticamente?: boolean;

  // Jerarquía
  ruta_completa?: string;
  nivel_jerarquico?: number;
  elemento_padre?: string;
  path_jerarquico?: string;
  elementos_ancestros?: string;

  // Timestamps
  creado_en?: string;
  actualizado_en?: string;
}

export interface TagAgrupado {
  equipo_sugerido?: string;
  total_tags: number;
  tags: string[];
  unidades?: string[];
}

export interface AsignacionTagsEquipo {
  equipo_id: number;
  tags: string[];
}