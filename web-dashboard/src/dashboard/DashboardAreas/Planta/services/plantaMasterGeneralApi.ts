import { request } from './plantaRequest';

export interface MaestroGeneralItem {
  fase: string | null;

  proceso_id: number | null;
  proceso: string | null;

  subproceso_id: number | null;
  subproceso: string | null;

  equipo_id: number | null;
  equipo_codigo: string | null;
  equipo_nombre: string | null;

  componente_id: number | null;
  componente_codigo: string | null;
  componente_tag: string | null;
  componente_nombre: string | null;

  repuesto_id: number | null;
  repuesto_nombre: string | null;
}

export async function getMasterGeneral(): Promise<MaestroGeneralItem[]> {
  return request<MaestroGeneralItem[]>('/planta/master-general');
}