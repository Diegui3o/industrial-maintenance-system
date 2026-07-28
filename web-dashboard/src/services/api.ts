const BASE = '/api'

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

export const getEquipos = () => fetchJson<any[]>('/equipos');
export const getEquipo = (id: number) => fetchJson<any>(`/equipos/${id}`);
export const createEquipo = (data: any) => fetchJson<any>('/equipos', { method: 'POST', body: JSON.stringify(data) });
export const getAlarmas = (params?: { estado?: string }) => {
  const q = new URLSearchParams(params as any).toString();
  return fetchJson<any[]>(`/alarmas?${q}`);
};
export const getEventos = (params?: { abierto?: boolean }) => {
  const q = new URLSearchParams(params as any).toString();
  return fetchJson<any[]>(`/eventos-estado?${q}`);
};

export const createDispositivoRed = (equipoId: number, data: any) =>
  fetchJson<any>(`/equipos/${equipoId}/dispositivos`, { method: 'POST', body: JSON.stringify(data) })

// Configuración de fuentes (ping/PI)
export const createConfigFuente = (equipoId: number, data: any) =>
  fetchJson<any>('/config/fuentes', { method: 'POST', body: JSON.stringify({ ...data, equipo_id: equipoId }) })

// Mantenimiento
export const createMantenimiento = (data: any) =>
  fetchJson<any>('/mantenimiento', { method: 'POST', body: JSON.stringify(data) })