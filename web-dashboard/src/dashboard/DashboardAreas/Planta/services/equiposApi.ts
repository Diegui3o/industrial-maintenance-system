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
  ip?: string;
}

export async function getEquipos(): Promise<Equipo[]> {
  const response = await fetch(`${BASE}/equipos`);

  if (!response.ok) {
    throw new Error('Error obteniendo equipos');
  }

  return response.json();
}