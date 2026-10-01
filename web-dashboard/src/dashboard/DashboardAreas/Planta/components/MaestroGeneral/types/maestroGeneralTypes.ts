import type { MaestroGeneralItem } from '../../../services/plantaMasterGeneralApi';

export type ColumnaFiltro =
  | 'fase'
  | 'proceso'
  | 'subproceso'
  | 'equipo'
  | 'componente'
  | 'repuesto';

export type Orden =
  | 'asc'
  | 'desc'
  | null;

export interface FiltroColumna {
  abierto: boolean;
  busqueda: string;
  seleccionados: string[];
  orden: Orden;
}

export type FiltrosColumnas = Record<
  ColumnaFiltro,
  FiltroColumna
>;

export interface FiltrosEstructura {
  fase: string;
  proceso: string;
  subproceso: string;
  equipo: string;
  componente: string;
}

export interface FiltrosClasificacion {
  tipo: string;
  taller: string;
  sistema: string;
  area: string;
  criticidad: string;
}

export interface FiltrosOperativos {
  estado: string;
  fabricante: string;
  marca: string;
  modelo: string;
  especialidad: string;
}

export interface MaestroGeneralFiltros {
  estructura: FiltrosEstructura;
  clasificacion: FiltrosClasificacion;
  operativos: FiltrosOperativos;
  busqueda: string;
  columnas: FiltrosColumnas;
}

export interface MaestroGeneralProps {
  datos: MaestroGeneralItem[];
}