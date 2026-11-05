// src/modules/umbrales/services/piTagsApi.ts
// Wrapper de los endpoints REALES de PI/tags (confirmados en pi_routes.go).

import type { TagDescubierto, TagAgrupado, AsignacionTagsEquipo } from '../../../shared/types/piTag';

const API_BASE = '';

function normalizarLista<T>(json: any): T[] {
  if (Array.isArray(json)) return json as T[];
  if (json && typeof json === 'object' && Array.isArray(json.value)) return json.value as T[];
  if (json && typeof json === 'object' && 'value' in json && json.value == null) return [];
  if (json && typeof json === 'object' && Object.keys(json).length > 0) return [json as T];
  return [];
}

async function getJson(path: string): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function postJson(path: string, body: any): Promise<any> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.mensaje || `POST ${path} → ${res.status}`);
  }
  return res.json();
}

export const piTagsApi = {
  // ── Descubiertos / sin asignar ─────────────────────────────────
  getDescubiertos: async (): Promise<TagDescubierto[]> => {
    const data = await getJson('/api/pi/tags/descubiertos');
    return normalizarLista<TagDescubierto>(data);
  },

  getSinEquipo: async (): Promise<TagDescubierto[]> => {
    const data = await getJson('/api/pi/tags/sin-equipo');
    return normalizarLista<TagDescubierto>(data);
  },

  getSugerencias: async (): Promise<TagAgrupado[]> => {
    const data = await getJson('/api/pi/tags/sugerencias');
    return normalizarLista<TagAgrupado>(data);
  },

  getAgrupados: async (): Promise<TagAgrupado[]> => {
    const data = await getJson('/api/pi/tags/agrupados');
    return normalizarLista<TagAgrupado>(data);
  },

  // ── Tags de un equipo ──────────────────────────────────────────
  getTagsPorEquipo: async (equipoId: number): Promise<any> => {
    const data = await getJson(`/api/pi/tags/equipo/${equipoId}`);
    // El backend devuelve { equipo_id, equipo_nombre, tags: [], total_tags } o [] si vacío
    return data;
  },

  // ── Asignación ────────────────────────────────────────────────
  // Firma real del backend: { equipo_id: number, tags: string[] }
  asignarTagsAEquipo: async (equipoId: number, tags: string[]): Promise<any> => {
    const body: AsignacionTagsEquipo = { equipo_id: equipoId, tags };
    return postJson('/api/pi/tags/asignar', body);
  },

  asignarMultiplesPorId: async (equipoId: number, tagIds: number[]): Promise<any> => {
    return postJson('/api/pi/tags/asignar-multiple', {
      equipo_id: equipoId,
      tag_ids: tagIds,
    });
  },
    
};