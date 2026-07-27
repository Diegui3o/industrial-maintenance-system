const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
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