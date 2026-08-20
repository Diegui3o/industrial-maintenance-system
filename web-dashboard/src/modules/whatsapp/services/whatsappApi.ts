const BASE = '/api';

export const getWhatsAppKey = () => localStorage.getItem('api_key') || '';
export const getWhatsAppQR = () => `/api/whatsapp/qr`;

async function fetchWithKey<T>(url: string, options?: RequestInit): Promise<T> {
  const apiKey = getWhatsAppKey();
  if (!apiKey) throw new Error('API Key no configurada');

  const res = await fetch(`${BASE}${url}?api_key=${apiKey}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 401) throw new Error('No autorizado');
  if (!res.ok) throw new Error(`Error ${res.status}`);
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
  fetchWithKey<any>(`/grupos/${grupoId}/enviar`, {
    method: 'POST',
    body: JSON.stringify({ mensaje }),
  });

export const getWhatsAppStatus = () =>
  fetchWithKey<any>('/whatsapp/status').catch(() => ({ conectado: false }));

export const setWhatsAppKey = (_key: string) => {
  // No es necesario guardar en variable, usamos localStorage
  localStorage.setItem('api_key', _key);
};

export const clearWhatsAppKey = () => {
  localStorage.removeItem('api_key');
};