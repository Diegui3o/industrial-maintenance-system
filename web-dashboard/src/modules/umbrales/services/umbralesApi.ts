// src/modules/umbrales/services/umbralesApi.ts
const API_BASE = '';

export interface Umbral {
  id: number;
  equipo_id: number;
  componente_id: number | null;
  repuesto_id: number | null;
  tag_id: number | null;
  parametro: string;
  umbral_min: number | null;
  umbral_max: number | null;
  unidad: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  activo: boolean;
  modo: 'fallo' | 'alerta';
  contar_tiempo_activo: boolean;
  lecturas_confirmacion: number;
}

export interface TagDescubierto {
  id: number;
  tag_name: string;
  element_name: string;
  unidad: string;
  ultimo_valor: number | null;
  equipo_id: number | null;
}

export async function getUmbrales(): Promise<Umbral[]> {
  const res = await fetch(`${API_BASE}/api/config/umbrales`);
  if (!res.ok) throw new Error(`GET /api/config/umbrales -> ${res.status}`);
  const json = await res.json();
  return (json?.value || json || []) as Umbral[];
}

export async function createUmbral(data: Partial<Umbral>): Promise<any> {
  const res = await fetch(`${API_BASE}/api/config/umbrales`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`POST /api/config/umbrales -> ${res.status}`);
  return res.json();
}

export async function deleteUmbral(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/config/umbrales/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`DELETE /api/config/umbrales/${id} -> ${res.status}`);
}

export async function getTagsDescubiertos(): Promise<TagDescubierto[]> {
  const res = await fetch(`${API_BASE}/api/pi/tags/descubiertos`);
  if (!res.ok) throw new Error(`GET /api/pi/tags/descubiertos -> ${res.status}`);
  const json = await res.json();
  return (json?.value || json || []) as TagDescubierto[];
}