// src/shared/types/seleccionJerarquica.ts
// Tipos para el selector jerárquico completo del sistema.
// IDs numéricos reales (no string) que vienen del backend Go.

export type NivelJerarquia =
  | 'area'
  | 'proceso'
  | 'subproceso'
  | 'equipo'
  | 'componente'
  | 'subcomponente'
  | 'repuesto';

export interface ProcesoPlanta {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface SubprocesoPlanta {
  id: number;
  proceso_id: number;
  nombre: string;
  activo: boolean;
}

export interface EquipoJerarquia {
  id: number;
  codigo: string;
  nombre: string;
  area: string;
  tipo?: string;
  fase?: string;
  estado_equipo?: string;
  critico?: boolean;
  subproceso_nombre?: string;
  subproceso_id?: number;
}

export interface ComponenteJerarquia {
  id: number;
  equipo_id: number;
  codigo: string;
  codigo_sap?: string;
  tag?: string;
  nombre: string;
  tipo_componente?: string;
  marca?: string;
  modelo?: string;
  numero_serie?: string;
  activo?: boolean;
  estado_componente?: string;
  [key: string]: any;
}

export interface SubcomponenteJerarquia {
  id: number;
  componente_id: number;
  nombre: string;
  activo?: boolean;
  [key: string]: any;
}

export interface RepuestoJerarquia {
  id: number;
  codigo: string;
  codigo_sap?: string;
  nombre: string;
  categoria?: string;
  stock_actual?: number;
  estado?: string;
  [key: string]: any;
}

export interface SeleccionJerarquica {
  procesoId?: number;
  subprocesoId?: number;
  equipoId?: number;
  componenteId?: number;
  subcomponenteId?: number;
  repuestoId?: number;

  tipo: 'equipo' | 'componente' | 'subcomponente' | 'repuesto' | '';

  nombreCompleto: string;

  labels?: {
    area?: string;
    proceso?: string;
    subproceso?: string;
    equipo?: string;
    componente?: string;
    subcomponente?: string;
    repuesto?: string;
  };
}

export type OnSeleccionJerarquica = (seleccion: SeleccionJerarquica) => void;