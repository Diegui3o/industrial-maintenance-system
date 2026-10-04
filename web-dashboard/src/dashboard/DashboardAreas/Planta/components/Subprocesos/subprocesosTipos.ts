export type TipoSubproceso =
  | 'proceso'
  | 'sistema';

export interface SubprocesoCatalogo {
  clave: string;
  tipo: TipoSubproceso;
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  procesoId: number | null;
  sistemaId: number | null;
  procesoNombre: string;
  sistemaNombre: string;
}