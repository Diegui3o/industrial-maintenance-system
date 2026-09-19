import { request } from './plantaRequest';
import type {
  Proceso,
  Subproceso,
  SubprocesoSistemaPlanta,
  SistemaPlanta,
  ClasificacionPlanta,
} from './plantaEstructuraApi';

/* =========================================================
   EQUIPOS
========================================================= */

export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  area?: string;
  tipo?: string;
  fase?: string;
  fabricante?: string;
  modelo?: string;
  numero_serie?: string;
  critico?: boolean;
  estado_equipo?: string;
  fase_ubicacion?: string;
  area_funcional?: string;
  ip?: string;
  relacionado?: boolean;
}

export async function getEquiposSinUbicar(): Promise<Equipo[]> {
  return request<Equipo[]>(
    '/planta/equipos/sin-ubicar'
  );
}

export async function getEquiposPorSubproceso(
  subprocesoId: number
): Promise<Equipo[]> {
  return request<Equipo[]>(
    `/planta/subprocesos/${subprocesoId}/equipos`
  );
}

export async function asignarEquipoSubproceso(
  equipoId: number,
  subprocesoId: number
): Promise<void> {
  await request<void>(
    `/planta/equipos/${equipoId}/subproceso`,
    {
      method: 'POST',
      body: JSON.stringify({
        subproceso_id: subprocesoId,
      }),
    }
  );
}

export async function getEquiposDisponiblesSistema(): Promise<Equipo[]> {
  return request<Equipo[]>(
    '/planta/sistemas/equipos-disponibles'
  );
}

/* =========================================================
   EQUIPOS - SISTEMAS
========================================================= */

export async function getEquiposPorSubprocesoSistema(
  subprocesoSistemaId: number
): Promise<Equipo[]> {
  return request<Equipo[]>(
    `/planta/sistemas/subprocesos/${subprocesoSistemaId}/equipos`
  );
}

export async function asignarEquipoSubprocesoSistema(
  subprocesoSistemaId: number,
  equipoId: number
): Promise<void> {
  await request<void>(
    `/planta/sistemas/subprocesos/${subprocesoSistemaId}/equipos`,
    {
      method: 'POST',
      body: JSON.stringify({
        equipo_id: equipoId,
      }),
    }
  );
}

/* =========================================================
   EQUIPOS - RELACIÓN CON SUBPROCESO
========================================================= */

export async function getEquiposParaRelacionSubproceso(
  subprocesoId: number
): Promise<Equipo[]> {
  return request<Equipo[]>(
    `/planta/subprocesos/${subprocesoId}/equipos-relacion`
  );
}

export async function relacionarEquiposConSubproceso(
  subprocesoId: number,
  equipoIds: number[]
): Promise<void> {
  await request<void>(
    `/planta/subprocesos/${subprocesoId}/equipos-relacion`,
    {
      method: 'PUT',
      body: JSON.stringify({
        equipo_ids: equipoIds,
      }),
    }
  );
}

/* =========================================================
   DETALLE DE EQUIPO
========================================================= */

export interface EquipoPlantaDetalle {
  equipo: Equipo;
  proceso?: Proceso;
  subproceso?: Subproceso;
  sistema?: SistemaPlanta;
  subproceso_sistema?: SubprocesoSistemaPlanta;
  clasificaciones: ClasificacionPlanta[];
  sistemas: SistemaPlanta[];
  componentes: import('./plantaComponentesApi').Componente[];
}

export async function getEquipoPlantaDetalle(
  equipoId: number
): Promise<EquipoPlantaDetalle> {
  return request<EquipoPlantaDetalle>(
    `/planta/equipos/${equipoId}/detalle`
  );
}

/* =========================================================
   TIPOS DE EQUIPO
========================================================= */

export interface TipoEquipo {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getTiposEquipo(): Promise<TipoEquipo[]> {
  return request<TipoEquipo[]>(
    '/planta/tipos-equipo'
  );
}

export async function crearTipoEquipo(data: {
  codigo: string;
  nombre: string;
  descripcion?: string;
}): Promise<TipoEquipo> {
  return request<TipoEquipo>(
    '/planta/tipos-equipo',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function asignarTipoEquipo(
  equipoId: number,
  tipoEquipoId: number
): Promise<void> {
  await request<void>(
    `/planta/equipos/${equipoId}/tipos`,
    {
      method: 'POST',
      body: JSON.stringify({
        tipo_equipo_id: tipoEquipoId,
      }),
    }
  );
}

export async function getTiposEquipoPorEquipo(
  equipoId: number
): Promise<TipoEquipo[]> {
  return request<TipoEquipo[]>(
    `/planta/equipos/${equipoId}/tipos`
  );
}

export async function desasignarTipoEquipo(
  equipoId: number,
  tipoEquipoId: number
): Promise<void> {
  await request<void>(
    `/planta/equipos/${equipoId}/tipos`,
    {
      method: 'DELETE',
      body: JSON.stringify({
        tipo_equipo_id: tipoEquipoId,
      }),
    }
  );
}