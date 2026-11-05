import type { Alarma } from "../../../shared/types/alarma";

const API_BASE = '';

export async function getAlarmas(): Promise<Alarma[]> {
  const res = await fetch(`${API_BASE}/api/alarmas`);
  if (!res.ok) throw new Error(`GET /api/alarmas -> ${res.status}`);
  const json = await res.json();
  if (json && typeof json === 'object' && 'value' in json) {
    return json.value as Alarma[];
  }
  return (json || []) as Alarma[];
}

export async function atenderAlarma(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/alarmas/${id}/atender`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error(`PUT /api/alarmas/${id}/atender -> ${res.status}`);
}

export async function cerrarAlarma(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/alarmas/${id}/cerrar`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error(`PUT /api/alarmas/${id}/cerrar -> ${res.status}`);
}
