const BASE = '/api';

let apiKey = '';

export const setWhatsAppKey = (key: string) => { apiKey = key; };
export const getWhatsAppKey = () => apiKey;
export const clearWhatsAppKey = () => { apiKey = ''; };
export const getWhatsAppQR = () => `/api/whatsapp/qr`;

async function fetchWithKey<T>(url: string, options?: RequestInit): Promise<T> {
  if (!apiKey) throw new Error('API Key no configurada');

  const res = await fetch(`${BASE}${url}?api_key=${apiKey}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 401) {
    clearWhatsAppKey();
    throw new Error('Sesión expirada');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error || `${res.status}`);
  }

  return res.json();
}

// Verificar API Key (devuelve datos del usuario)
export const verificarKey = (key: string) =>
  fetch(`/api/usuarios/keys?api_key=${key}`).then(r => r.json());

// Grupos
export const getGrupos = () => fetchWithKey<any[]>('/grupos');
export const createGrupo = (data: { nombre: string; jid: string }) =>
  fetchWithKey<any>('/grupos', { method: 'POST', body: JSON.stringify(data) });
export const deleteGrupo = (id: number) =>
  fetchWithKey<any>(`/grupos/${id}`, { method: 'DELETE' });

// Equipos del grupo
export const getEquiposDeGrupo = (grupoId: number) =>
  fetchWithKey<any[]>(`/grupos/${grupoId}/equipos`);
export const asociarEquipoAGrupo = (equipoId: number, grupoId: number) =>
  fetchWithKey<any>(`/equipos/${equipoId}/grupos`, { method: 'POST', body: JSON.stringify({ grupo_id: grupoId }) });
export const desasociarEquipoDeGrupo = (equipoId: number, grupoId: number) =>
  fetchWithKey<any>(`/equipos/${equipoId}/grupos/${grupoId}`, { method: 'DELETE' });

// WhatsApp
export const getGruposReales = () => fetchWithKey<any[]>('/whatsapp/grupos');
export const enviarMensajeGrupo = (grupoId: number, mensaje: string) =>
  fetchWithKey<any>(`/grupos/${grupoId}/enviar`, { method: 'POST', body: JSON.stringify({ mensaje }) });

export const getWhatsAppStatus = () =>
  fetchWithKey<any>('/whatsapp/status').catch(() => ({ conectado: false }));