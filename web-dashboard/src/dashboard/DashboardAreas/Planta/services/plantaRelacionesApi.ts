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
    throw new Error(
      texto || `Error HTTP ${response.status}`
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export interface SubprocesoRelacion {
  id: number;
  proceso_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export async function getTodosSubprocesosRelacion(): Promise<
  SubprocesoRelacion[]
> {
  return request<SubprocesoRelacion[]>(
    '/planta/subprocesos'
  );
}

export async function relacionarSubprocesosConProceso(
  procesoId: number,
  subprocesoIds: number[]
): Promise<void> {
  await request<void>(
    `/planta/procesos/${procesoId}/subprocesos/relacion`,
    {
      method: 'POST',
      body: JSON.stringify({
        subproceso_ids: subprocesoIds,
      }),
    }
  );
}