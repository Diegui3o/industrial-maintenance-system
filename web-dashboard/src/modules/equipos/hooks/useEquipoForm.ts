export interface EquipoFormData {
  // Paso 1
  codigo: string
  nombre: string
  area: string
  tipo: string
  fase: string
  fabricante: string
  modelo: string
  numero_serie: string
  estado_equipo: string
  fecha_instalacion: string

  // Paso 2
  activo_padre_id: number | null
  nivel_jerarquia: number
  tag: string
  ubicacion_fisica: string
  descripcion_larga: string

  // Paso 3
  es_dispositivo_red: boolean
  tipo_dispositivo: string
  ip: string
  puerto: number
  protocolo: string
  usuario_red: string
  password_hash: string
  requiere_monitoreo: boolean
  tipo_fuente: string
  endpoint: string
  intervalo_segundos: number
  timeout_segundos: number
  reintentos: number
  critico: boolean

  // Paso 4 (mantenimiento inicial)
  requiere_mantenimiento: boolean
  fecha_reporte: string
  fase_mant: string
  taller: string
  tipo_criticidad: string
  sistema: string
  inicio_parada: string
  fin_parada: string
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

export const emptyForm: EquipoFormData = {
  codigo: '', nombre: '', area: '', tipo: '', fase: '', fabricante: '', modelo: '',
  numero_serie: '', estado_equipo: 'activo', fecha_instalacion: '',
  activo_padre_id: null, nivel_jerarquia: 0, tag: '', ubicacion_fisica: '', descripcion_larga: '',
  es_dispositivo_red: false, tipo_dispositivo: '', ip: '', puerto: 0,
  protocolo: '', usuario_red: '', password_hash: '',
  requiere_monitoreo: false, tipo_fuente: 'ping', endpoint: '',
  intervalo_segundos: 60, timeout_segundos: 10, reintentos: 3, critico: false,
  requiere_mantenimiento: false, fecha_reporte: new Date().toISOString().split('T')[0],
  fase_mant: '', taller: '', tipo_criticidad: '', sistema: '',
  inicio_parada: '', fin_parada: '', horas: 0, tipo_intervencion: '',
  modo_falla: '', consecuencia_inmediata: '', descripcion_evento: '',
  stand_by: false, produccion_afectada: false, tn_dejadas_procesar: 0, enlace: ''
}