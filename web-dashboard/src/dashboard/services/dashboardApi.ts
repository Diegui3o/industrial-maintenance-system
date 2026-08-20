const BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export const getIncidentes = () => fetchJson<any[]>('/api/incidentes');
export const getEquipos = () => fetchJson<any[]>(`${BASE}/equipos`);
export const getMantenimientos = () => fetchJson<any[]>(`${BASE}/mantenimiento`);
export const getRaices = () => fetchJson<any[]>(`${BASE}/equipos/raices`);
export const getHijos = (id: number) => fetchJson<any[]>(`${BASE}/equipos/${id}/hijos`);
export const getCriticos = () => fetchJson<any[]>(`${BASE}/equipos/criticos`);

export const getRequerimientos = async (): Promise<any[]> => {
  try {
    return await fetchJson<any[]>('/api/requerimientos');
  } catch {
    return [];
  }
};

export const updateFirestoreDoc = (
  collection: string,
  id: string,
  data: any
) =>
  fetchJson<any>(`/api/firestore/${collection}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });