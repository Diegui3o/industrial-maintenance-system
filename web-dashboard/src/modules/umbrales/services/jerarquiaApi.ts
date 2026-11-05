// src/modules/umbrales/services/jerarquiaApi.ts
// Servicio con los endpoints REALES del backend Go.
// Confirmado: /api/planta/equipos?subproceso_id=X devuelve 404.
// Por eso filtramos equipos por subproceso_nombre en cliente.

import type {
  ProcesoPlanta,
  SubprocesoPlanta,
  EquipoJerarquia,
  ComponenteJerarquia,
  SubcomponenteJerarquia,
  RepuestoJerarquia,
} from '../../../shared/types/seleccionJerarquica';

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
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

const norm = (s: any): string =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().trim();

export const jerarquiaApi = {
  getProcesos: async (): Promise<ProcesoPlanta[]> => {
    const data = await getJson('/api/planta/procesos');
    return normalizarLista<ProcesoPlanta>(data);
  },

  getSubprocesosPorProceso: async (procesoId: number): Promise<SubprocesoPlanta[]> => {
    const data = await getJson('/api/planta/subprocesos');
    const todos = normalizarLista<SubprocesoPlanta>(data);
    return todos.filter((s) => Number(s.proceso_id) === Number(procesoId));
  },

  getEquiposPorSubproceso: async (
    _subprocesoId: number,           // ← prefijo _
    subprocesoNombre: string,
  ): Promise<EquipoJerarquia[]> => {
    const data = await getJson('/api/equipos');
    const todos = normalizarLista<EquipoJerarquia>(data);
    if (!subprocesoNombre) return todos;
    const objetivo = norm(subprocesoNombre);
    return todos.filter((eq) => norm(eq.subproceso_nombre) === objetivo);
  },

  getComponentesPorEquipo: async (equipoId: number): Promise<ComponenteJerarquia[]> => {
    const data = await getJson(`/api/planta/equipos/${equipoId}/componentes`);
    return normalizarLista<ComponenteJerarquia>(data);
  },

  getSubcomponentesPorComponente: async (
    componenteId: number,
  ): Promise<SubcomponenteJerarquia[]> => {
    const data = await getJson(`/api/planta/componentes/${componenteId}/subcomponentes`);
    return normalizarLista<SubcomponenteJerarquia>(data);
  },

  getRepuestosPorComponente: async (
    componenteId: number,
  ): Promise<RepuestoJerarquia[]> => {
    const data = await getJson(`/api/planta/componentes/${componenteId}/repuestos`);
    return normalizarLista<RepuestoJerarquia>(data);
  },

  getRepuestosPorSubcomponente: async (
    subcomponenteId: number,
  ): Promise<RepuestoJerarquia[]> => {
    const data = await getJson(`/api/planta/subcomponentes/${subcomponenteId}/repuestos`);
    return normalizarLista<RepuestoJerarquia>(data);
  },
};