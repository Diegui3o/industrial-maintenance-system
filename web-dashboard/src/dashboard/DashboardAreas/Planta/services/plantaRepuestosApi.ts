import { request } from "./plantaRequest";
export type EstadoRepuesto = 'activo' | 'inactivo' | 'falla' | 'planeado' | 'obsoleto';

export interface Repuesto {
  id: number;
  codigo?: string | null;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  codigo_sap?: string | null;
  categoria?: string | null;
  criticidad?: string | null;
  stock_actual: number;
  stock_minimo: number;
  unidad_medida?: string | null;
  marca?: string | null;
  modelo?: string | null;
  estado?: EstadoRepuesto | null;
  especificaciones_tecnicas?: string | null;
  creado_en?: string | null;
  actualizado_en?: string | null;
}

export interface RepuestoActualizacion {
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  activo?: boolean;
  codigo_sap?: string | null;
  categoria?: string | null;
  criticidad?: string | null;
  stock_actual?: number | null;
  stock_minimo?: number | null;
  unidad_medida?: string | null;
  marca?: string | null;
  modelo?: string | null;
  estado?: 'activo' | 'inactivo' | 'falla' | 'planeado' | 'obsoleto';  // ← AGREGAR
  especificaciones_tecnicas?: string | null;
}

export interface RepuestoHistorial {
  id: number;
  repuesto_id: number;
  campo: string;
  valor_anterior?: string | null;
  valor_nuevo?: string | null;
  tipo_origen: "MANUAL" | "PI_SYSTEM" | "OTRO";
  usuario_id?: number | null;
  conector_id?: string | null;
  comentario?: string | null;
  creado_en: string;
}

export async function getRepuestos(): Promise<Repuesto[]> {
  return request<Repuesto[]>("/planta/repuestos");
}

export async function crearRepuesto(data: RepuestoActualizacion): Promise<Repuesto> {
  return request<Repuesto>("/planta/repuestos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function actualizarRepuesto(
  id: number,
  data: RepuestoActualizacion
): Promise<void> {
  await request<void>(`/planta/repuestos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function eliminarRepuesto(id: number): Promise<void> {
  await request<void>(`/planta/repuestos/${id}`, {
    method: "DELETE",
  });
}

export async function getHistorialRepuesto(id: number): Promise<RepuestoHistorial[]> {
  return request<RepuestoHistorial[]>(`/planta/repuestos/${id}/historial`);
}

export async function getEquiposCompatibles(id: number): Promise<number[]> {
  return request<number[]>(`/planta/repuestos/${id}/equipos-compatibles`);
}

export async function agregarCompatibilidadEquipo(
  repuestoId: number,
  equipoId: number
): Promise<void> {
  await request<void>(`/planta/repuestos/${repuestoId}/equipos-compatibles`, {
    method: "POST",
    body: JSON.stringify({ equipo_id: equipoId }),
  });
}

export async function eliminarCompatibilidadEquipo(
  repuestoId: number,
  equipoId: number
): Promise<void> {
  await request<void>(`/planta/repuestos/${repuestoId}/equipos-compatibles/${equipoId}`, {
    method: "DELETE",
  });
}