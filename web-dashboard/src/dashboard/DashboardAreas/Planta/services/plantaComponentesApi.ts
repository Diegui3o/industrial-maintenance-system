import { request } from './plantaRequest';

export interface Componente {
  id: number;
  equipo_id: number | null;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

/* =========================================================
   COMPONENTES
========================================================= */

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
  return request<Componente>(
    '/planta/componentes',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
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
  return request<Componente>(
    `/planta/componentes/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

/* =========================================================
   COMPONENTES - RELACIÓN CON EQUIPO
========================================================= */

export async function getComponentesParaRelacionEquipo(
  equipoId: number
): Promise<Componente[]> {
  return request<Componente[]>(
    `/planta/equipos/${equipoId}/componentes-relacion`
  );
}

export async function getTodosComponentes(): Promise<Componente[]> {
  return request<Componente[]>(
    '/planta/componentes'
  );
}

export interface RelacionComponente {
  componente_id: number;
  equipo_id: number | null;
}

export async function relacionarComponentesConEquipo(
  equipoId: number,
  relaciones: RelacionComponente[]
): Promise<void> {
  await request<void>(
    `/planta/equipos/${equipoId}/componentes-relacion`,
    {
      method: 'PUT',
      body: JSON.stringify({
        relaciones,
      }),
    }
  );
}