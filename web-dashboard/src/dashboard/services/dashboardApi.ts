const BASE = '/api';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export const getIncidentes = () => fetchJson<any[]>('/api/incidentes');
export const getEquipos = () => fetchJson<any[]>(`${BASE}/equipos`);
export const getMantenimientos = () => fetchJson<any[]>(`${BASE}/mantenimiento`);
export const getRaices = () => fetchJson<any[]>(`${BASE}/equipos/raices`);
export const getHijos = (id: number) => fetchJson<any[]>(`${BASE}/equipos/${id}/hijos`);
export const getCriticos = () => fetchJson<any[]>(`${BASE}/equipos/criticos`);