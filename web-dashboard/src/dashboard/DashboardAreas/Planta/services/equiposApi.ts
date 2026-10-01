const BASE = '/api';

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
  fecha_instalacion?: string | null;
  fecha_creacion?: string;
  actualizado_en?: string | null;
  fase_ubicacion?: string;
  area_funcional?: string;
  ip?: string;
  relacionado?: boolean;
}

interface EquiposResponse {
  value: Equipo[];
  Count?: number;
}

export async function getEquipos(): Promise<Equipo[]> {
  const response = await fetch(`${BASE}/equipos`);

  if (!response.ok) {
    throw new Error('Error obteniendo equipos');
  }

  const data: Equipo[] | EquiposResponse =
    await response.json();

  if (Array.isArray(data)) {
    return data;
  }

  return data.value ?? [];
}