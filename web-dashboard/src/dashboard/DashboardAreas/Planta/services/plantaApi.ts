const BASE = '/api';

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(texto || `Error HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

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

export async function getTodosSubprocesos(): Promise<
  Subproceso[]
> {
  return request<Subproceso[]>(
    '/planta/subprocesos'
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
/* SUBPROCESOS DE SISTEMA */

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


/* SUBCOMPONENTES */

export interface Subcomponente {
  id: number;
  componente_id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getSubcomponentes(
  componenteId: number
): Promise<Subcomponente[]> {
  return request<Subcomponente[]>(
    `/planta/componentes/${componenteId}/subcomponentes`
  );
}

export async function crearSubcomponente(data: {
  componente_id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
}): Promise<Subcomponente> {
  return request<Subcomponente>(
    '/planta/subcomponentes',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function actualizarSubcomponente(
  id: number,
  data: {
    componente_id: number;
    codigo?: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<Subcomponente> {
  return request<Subcomponente>(
    `/planta/subcomponentes/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

/* REPUESTOS DE SUBCOMPONENTE */

export interface SubcomponenteRepuesto {
  repuesto_id: number;
  codigo?: string;
  nombre: string;
  cantidad: number;
  posicion?: string;
  notas?: string;
}

export async function getRepuestosSubcomponente(
  subcomponenteId: number
): Promise<SubcomponenteRepuesto[]> {
  return request<SubcomponenteRepuesto[]>(
    `/planta/subcomponentes/${subcomponenteId}/repuestos`
  );
}

export async function asignarRepuestoSubcomponente(
  subcomponenteId: number,
  data: {
    repuesto_id: number;
    cantidad: number;
    posicion?: string;
    notas?: string;
  }
): Promise<void> {
  await request<void>(
    `/planta/subcomponentes/${subcomponenteId}/repuestos`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}
/* =========================================================
   COMPONENTES
========================================================= */

export interface Componente {
  id: number;
  equipo_id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getComponentes(
  equipoId: number
): Promise<Componente[]> {
  return request<Componente[]>(
    `/planta/equipos/${equipoId}/componentes`
  );
}

export async function crearComponente(data: {
  equipo_id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
}): Promise<Componente> {
  return request<Componente>('/planta/componentes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarComponente(
  id: number,
  data: {
    equipo_id: number;
    codigo?: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<Componente> {
  return request<Componente>(`/planta/componentes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
export async function getEquiposDisponiblesSistema(): Promise<Equipo[]> {
  return request<Equipo[]>(
    '/planta/sistemas/equipos-disponibles'
  );
}
/* =========================================================
   REPUESTOS
========================================================= */

export interface Repuesto {
  id: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface ComponenteRepuesto {
  repuesto_id: number;
  codigo?: string;
  nombre: string;
  cantidad: number;
  posicion?: string;
  notas?: string;
}

export async function getRepuestos(): Promise<Repuesto[]> {
  return request<Repuesto[]>('/planta/repuestos');
}

export async function crearRepuesto(data: {
  codigo?: string;
  nombre: string;
  descripcion?: string;
}): Promise<Repuesto> {
  return request<Repuesto>('/planta/repuestos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function actualizarRepuesto(
  id: number,
  data: {
    codigo?: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<Repuesto> {
  return request<Repuesto>(`/planta/repuestos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getRepuestosComponente(
  componenteId: number
): Promise<ComponenteRepuesto[]> {
  return request<ComponenteRepuesto[]>(
    `/planta/componentes/${componenteId}/repuestos`
  );
}

export async function asignarRepuesto(
  componenteId: number,
  data: {
    repuesto_id: number;
    cantidad: number;
    posicion?: string;
    notas?: string;
  }
): Promise<void> {
  await request<void>(
    `/planta/componentes/${componenteId}/repuestos`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function actualizarComponenteRepuesto(
  componenteId: number,
  repuestoId: number,
  data: {
    cantidad: number;
    posicion?: string;
    notas?: string;
  }
): Promise<void> {
  await request<void>(
    `/planta/componentes/${componenteId}/repuestos/${repuestoId}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
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

export async function getSistemasEquipo(
  equipoId: number
): Promise<SistemaPlanta[]> {
  return request<SistemaPlanta[]>(
    `/planta/equipos/${equipoId}/sistemas`
  );
}

export async function asignarSistemasEquipo(
  equipoId: number,
  sistemaIds: number[]
): Promise<void> {
  await request<void>(
    `/planta/equipos/${equipoId}/sistemas`,
    {
      method: 'POST',
      body: JSON.stringify({
        sistema_ids: sistemaIds,
      }),
    }
  );
}
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

export async function getEquipoPlantaDetalle(
  equipoId: number
): Promise<EquipoPlantaDetalle> {
  return request<EquipoPlantaDetalle>(
    `/planta/equipos/${equipoId}/detalle`
  );
}

export interface SubprocesoPlanta {
  id: number;
  proceso_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface EquipoPlantaDetalle {
  equipo: Equipo

  proceso?: Proceso
  subproceso?: SubprocesoPlanta

  sistema?: SistemaPlanta
  subproceso_sistema?: SubprocesoSistemaPlanta

  clasificaciones: ClasificacionPlanta[]
  sistemas: SistemaPlanta[]
  componentes: Componente[]
}
/* =========================================================
   TIPOS DE EQUIPO
========================================================= */

export interface TipoEquipo {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  activo: boolean
}

export async function getTiposEquipo(): Promise<TipoEquipo[]> {
  return request<TipoEquipo[]>(
    '/planta/tipos-equipo'
  )
}

export async function crearTipoEquipo(
  data: {
    codigo: string
    nombre: string
    descripcion?: string
  }
): Promise<TipoEquipo> {
  return request<TipoEquipo>(
    '/planta/tipos-equipo',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  )
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
  )
}

export async function getTiposEquipoPorEquipo(
  equipoId: number
): Promise<TipoEquipo[]> {
  return request<TipoEquipo[]>(
    `/planta/equipos/${equipoId}/tipos`
  )
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
  )
}