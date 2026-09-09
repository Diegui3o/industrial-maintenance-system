const BASE = '/api/planta';

export interface Proceso {
  id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Subproceso {
  id: number;
  proceso_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

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
  ip?: string;
}

export interface EquipoPlanta {
  equipo_id: number;
  subproceso_id: number;
}

export async function getProcesos(): Promise<Proceso[]> {
  const response = await fetch(`${BASE}/procesos`);

  if (!response.ok) {
    throw new Error('Error obteniendo procesos');
  }

  return response.json();
}

export async function crearProceso(data: {
  nombre: string;
  descripcion?: string;
}): Promise<Proceso> {
  const response = await fetch(`${BASE}/procesos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error creando proceso');
  }

  return response.json();
}

export async function actualizarProceso(
  id: number,
  data: {
    nombre: string;
    descripcion?: string;
    activo: boolean;
  }
): Promise<Proceso> {
  const response = await fetch(`${BASE}/procesos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error actualizando proceso');
  }

  return response.json();
}

export async function getSubprocesos(
  procesoId: number
): Promise<Subproceso[]> {
  const response = await fetch(
    `${BASE}/procesos/${procesoId}/subprocesos`
  );

  if (!response.ok) {
    throw new Error('Error obteniendo subprocesos');
  }

  return response.json();
}

export async function crearSubproceso(data: {
  proceso_id: number;
  nombre: string;
  descripcion?: string;
}): Promise<Subproceso> {
  const response = await fetch(`${BASE}/subprocesos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error creando subproceso');
  }

  return response.json();
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
  const response = await fetch(`${BASE}/subprocesos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Error actualizando subproceso');
  }

  return response.json();
}

export async function getEquiposPorSubproceso(
  subprocesoId: number
): Promise<Equipo[]> {
  const response = await fetch(
    `${BASE}/subprocesos/${subprocesoId}/equipos`
  );

  if (!response.ok) {
    throw new Error('Error obteniendo equipos del subproceso');
  }

  return response.json();
}

export async function asignarEquipoSubproceso(
  equipoId: number,
  subprocesoId: number
): Promise<EquipoPlanta> {
  const response = await fetch(
    `${BASE}/equipos/${equipoId}/subproceso`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subproceso_id: subprocesoId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Error asignando equipo al subproceso');
  }

  return response.json();
}

export async function actualizarEquipoSubproceso(
  equipoId: number,
  subprocesoId: number
): Promise<EquipoPlanta> {
  const response = await fetch(
    `${BASE}/equipos/${equipoId}/subproceso`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subproceso_id: subprocesoId,
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Error actualizando subproceso del equipo');
  }

  return response.json();
}