import { request } from './plantaRequest';

/* =========================================================
   PROCESOS
========================================================= */

export interface Proceso {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getProcesos(): Promise<Proceso[]> {
  return request<Proceso[]>('/planta/procesos');
}

export async function crearProceso(data: {
  nombre: string;
  descripcion?: string;
}): Promise<Proceso> {
  return request<Proceso>('/planta/procesos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarProceso(
  id: number,
  data: {
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<Proceso> {
  return request<Proceso>(`/planta/procesos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/* =========================================================
   SUBPROCESOS
========================================================= */

export interface Subproceso {
  id: number;
  proceso_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getSubprocesos(
  procesoId: number
): Promise<Subproceso[]> {
  return request<Subproceso[]>(
    `/planta/procesos/${procesoId}/subprocesos`
  );
}

export async function getTodosSubprocesos(): Promise<Subproceso[]> {
  return request<Subproceso[]>('/planta/subprocesos');
}

export async function relacionarSubprocesosConProceso(
  procesoId: number,
  subprocesoIds: number[]
): Promise<void> {
  await request<void>(
    `/planta/procesos/${procesoId}/subprocesos`,
    {
      method: 'PUT',
      body: JSON.stringify({
        subproceso_ids: subprocesoIds,
      }),
    }
  );
}

export async function crearSubproceso(data: {
  proceso_id: number;
  nombre: string;
  descripcion?: string;
}): Promise<Subproceso> {
  return request<Subproceso>('/planta/subprocesos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarSubproceso(
  id: number,
  data: {
    proceso_id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<Subproceso> {
  return request<Subproceso>(`/planta/subprocesos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/* =========================================================
   SUBPROCESOS DE SISTEMA
========================================================= */

export interface SubprocesoSistemaPlanta {
  id: number;
  sistema_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getSubprocesosSistema(
  sistemaId: number
): Promise<SubprocesoSistemaPlanta[]> {
  return request<SubprocesoSistemaPlanta[]>(
    `/planta/sistemas/${sistemaId}/subprocesos`
  );
}

export async function crearSubprocesoSistema(data: {
  sistema_id: number;
  nombre: string;
  descripcion?: string;
}): Promise<SubprocesoSistemaPlanta> {
  return request<SubprocesoSistemaPlanta>(
    '/planta/subprocesos-sistema',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function actualizarSubprocesoSistema(
  id: number,
  data: {
    sistema_id: number;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<SubprocesoSistemaPlanta> {
  return request<SubprocesoSistemaPlanta>(
    `/planta/subprocesos-sistema/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function getTodosSubprocesosSistema(): Promise<
  SubprocesoSistemaPlanta[]
> {
  return request<SubprocesoSistemaPlanta[]>(
    '/planta/subprocesos-sistema'
  );
}

/* =========================================================
   SISTEMAS
========================================================= */

export interface SistemaPlanta {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getSistemas(): Promise<SistemaPlanta[]> {
  return request<SistemaPlanta[]>('/planta/sistemas');
}

export async function crearSistema(data: {
  nombre: string;
  descripcion?: string;
}): Promise<SistemaPlanta> {
  return request<SistemaPlanta>('/planta/sistemas', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarSistema(
  id: number,
  data: {
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<SistemaPlanta> {
  return request<SistemaPlanta>(`/planta/sistemas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function relacionarSubprocesosConSistema(
  sistemaId: number,
  subprocesoIds: number[]
): Promise<void> {
  await request<void>(
    `/planta/sistemas/${sistemaId}/subprocesos`,
    {
      method: 'PUT',
      body: JSON.stringify({
        subproceso_ids: subprocesoIds,
      }),
    }
  );
}

/* =========================================================
   CLASIFICACIONES
========================================================= */

export interface ClasificacionPlanta {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getClasificaciones(): Promise<
  ClasificacionPlanta[]
> {
  return request<ClasificacionPlanta[]>(
    '/planta/clasificaciones'
  );
}

export async function crearClasificacion(data: {
  nombre: string;
  descripcion?: string;
}): Promise<ClasificacionPlanta> {
  return request<ClasificacionPlanta>(
    '/planta/clasificaciones',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function actualizarClasificacion(
  id: number,
  data: {
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<ClasificacionPlanta> {
  return request<ClasificacionPlanta>(
    `/planta/clasificaciones/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function getClasificacionesEquipo(
  equipoId: number
): Promise<ClasificacionPlanta[]> {
  return request<ClasificacionPlanta[]>(
    `/planta/equipos/${equipoId}/clasificaciones`
  );
}

export async function asignarClasificacionesEquipo(
  equipoId: number,
  clasificacionIds: number[]
): Promise<void> {
  await request<void>(
    `/planta/equipos/${equipoId}/clasificaciones`,
    {
      method: 'POST',
      body: JSON.stringify({
        clasificacion_ids: clasificacionIds,
      }),
    }
  );
}