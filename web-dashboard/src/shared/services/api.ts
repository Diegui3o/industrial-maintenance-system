const BASE = '/api'

const getApiKey = () => localStorage.getItem('api_key') || ''

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  if (url.startsWith('/grupos') || url.startsWith('/whatsapp')) {
    const key = getApiKey()
    if (key) headers['X-API-Key'] = key
  }

  const res = await fetch(`${BASE}${url}`, { headers, ...options })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export const guardarApiKey = (key: string) => localStorage.setItem('api_key', key)
export const obtenerApiKey = () => localStorage.getItem('api_key') || ''

export const getEquipos = () => fetchJson<any[]>('/equipos').catch(() => [])
export const getEquipo = (id: number) => fetchJson<any>(`/equipos/${id}`)
export const createEquipo = (data: any) => fetchJson<any>('/equipos', { method: 'POST', body: JSON.stringify(data) })

export const getAlarmas = (params?: { estado?: string }) => {
  const q = new URLSearchParams(params as any).toString()
  return fetchJson<any[]>(`/alarmas?${q}`)
}

export const getEventos = (params?: { abierto?: boolean }) => {
  const q = new URLSearchParams(params as any).toString()
  return fetchJson<any[]>(`/eventos-estado?${q}`)
}

export const createDispositivoRed = (equipoId: number, data: any) =>
  fetchJson<any>(`/equipos/${equipoId}/dispositivos`, { method: 'POST', body: JSON.stringify(data) })

export const createConfigFuente = (equipoId: number, data: any) =>
  fetchJson<any>('/config/fuentes', { method: 'POST', body: JSON.stringify({ ...data, equipo_id: equipoId }) })

export const createMantenimiento = (data: any) =>
  fetchJson<any>('/mantenimiento', { method: 'POST', body: JSON.stringify(data) })

export const getGrupos = () => fetchJson<any[]>('/grupos').catch(() => [])
export const createGrupo = (data: { nombre: string; jid: string }) =>
  fetchJson<any>('/grupos', { method: 'POST', body: JSON.stringify(data) })

export const updateGrupo = (id: number, data: { nombre: string; jid: string }) =>
  fetchJson<any>(`/grupos/${id}`, { method: 'PUT', body: JSON.stringify(data) })

export const deleteGrupo = (id: number) =>
  fetchJson<any>(`/grupos/${id}`, { method: 'DELETE' })

export const getEquiposDeGrupo = (grupoId: number) =>
  fetchJson<any[]>(`/grupos/${grupoId}/equipos`).catch(() => [])

export const getEquiposCriticos = () =>
  fetchJson<any[]>('/equipos/criticos').catch(() => [])

export const asociarEquipoAGrupo = (equipoId: number, grupoId: number) =>
  fetchJson<any>(`/equipos/${equipoId}/grupos`, { method: 'POST', body: JSON.stringify({ grupo_id: grupoId }) })

export const desasociarEquipoDeGrupo = (equipoId: number, grupoId: number) =>
  fetchJson<any>(`/equipos/${equipoId}/grupos/${grupoId}`, { method: 'DELETE' })

export const enviarMensajeGrupo = (grupoId: number, mensaje: string) =>
  fetchJson<any>(`/grupos/${grupoId}/enviar`, { method: 'POST', body: JSON.stringify({ mensaje }) })

export const getGruposReales = () =>
  fetchJson<any[]>('/whatsapp/grupos').catch(() => [])

export const getWhatsAppStatus = () =>
  fetchJson<any>('/whatsapp/status').catch(() => ({ conectado: false }))

export const getPIFuentes = () => 
  fetchJson<any[]>('/pi/fuentes').catch(() => [])

export const getPITagsAgrupados = (fuente?: string) => {
  const url = fuente ? `/pi/tags/agrupados?fuente=${fuente}` : '/pi/tags/agrupados'
  return fetchJson<any[]>(url).catch(() => [])
}

export const getPITagsSinEquipo = () => 
  fetchJson<any[]>('/pi/tags/sin-equipo').catch(() => [])

export const crearEquipoConTags = (data: {
  equipo: any
  tagNames: string[]
  umbrales?: any[]
  notificaciones?: any
}) => fetchJson<any>('/equipos/crear-con-tags', {
  method: 'POST',
  body: JSON.stringify(data)
})

export const getEquipoTags = (equipoId: number) =>
  fetchJson<any[]>(`/equipos/${equipoId}/tags`).catch(() => [])

export const getEquipoTiempoReal = (equipoId: number) =>
  fetchJson<any[]>(`/equipos/${equipoId}/tiempo-real`).catch(() => [])