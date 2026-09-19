import { request } from './plantaRequest';

/* =========================================================
   SUBCOMPONENTES
========================================================= */

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

/* =========================================================
   SUBCOMPONENTES - RELACIÓN
========================================================= */

export async function getSubcomponentesParaRelacion(
  componenteId: number
): Promise<Subcomponente[]> {
  return request<Subcomponente[]>(
    `/planta/componentes/${componenteId}/subcomponentes-relacion`
  );
}

export async function relacionarSubcomponentes(
  componenteId: number,
  subcomponenteIds: number[]
): Promise<void> {
  await request<void>(
    `/planta/componentes/${componenteId}/subcomponentes-relacion`,
    {
      method: 'PUT',
      body: JSON.stringify({
        subcomponente_ids: subcomponenteIds,
      }),
    }
  );
}

/* =========================================================
   REPUESTOS DE SUBCOMPONENTE
========================================================= */

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