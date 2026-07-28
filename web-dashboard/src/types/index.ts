export interface Equipo {
  id: number;
  codigo: string;
  nombre: string;
  area?: string;
  tipo?: string;
  fase?: string;
  fabricante?: string;
  modelo?: string;
  numero_serie?: string;
  critico: boolean;
  estado_equipo: 'activo' | 'inactivo' | 'fallo' | 'mantenimiento';
  fecha_instalacion?: string;
  fecha_creacion: string;
  actualizado_en?: string;
}

export interface Alarma {
  id: number;
  equipo_id: number;
  tipo?: string;
  mensaje?: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'activa' | 'atendida' | 'cerrada';
  fecha_generada: string;
  fecha_cierre?: string;
  equipo?: Equipo;
}

export interface EventoEstado {
  id: number;
  equipo_id: number;
  estado: 'activo' | 'inactivo' | 'fallo' | 'mantenimiento';
  motivo?: string;
  fecha_inicio: string;
  fecha_fin?: string;
  equipo?: Equipo;
}

export interface MetricaDiaria {
  id: number;
  equipo_id: number;
  fecha: string;
  horas_operacion?: number;
  horas_fallo?: number;
  creado_en: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  area?: string;
  creado_en: string;
}

export interface DispositivoRed {
  tipo_dispositivo: string
  ip: string
  puerto: number
  protocolo: string
  usuario: string
  password_hash: string
}

export interface ConfigFuente {
  tipo_fuente: string
  endpoint: string
  intervalo_segundos: number
  timeout_segundos: number
  reintentos: number
  activo: boolean
}

export interface MantenimientoCreate {
  equipo_id: number
  fecha_reporte: string
  fase: string
  taller: string
  tipo_criticidad: string
  sistema: string
  inicio_parada?: string
  fin_parada?: string
  horas: number
  tipo_intervencion: string
  modo_falla: string
  consecuencia_inmediata: string
  descripcion_evento: string
  stand_by: boolean
  produccion_afectada: boolean
  tn_dejadas_procesar: number
  enlace: string
}