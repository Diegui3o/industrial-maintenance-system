export interface CampoDefinicion {
  field: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'password' | 'select_estado' | 'select_area';
  placeholder?: string;
  section: 'generales' | 'jerarquia' | 'red' | 'monitoreo';
}

export const CAMPOS_EQUIPO: CampoDefinicion[] = [
  // Generales
  { field: 'codigo', label: 'Código', section: 'generales' },
  { field: 'nombre', label: 'Nombre', section: 'generales' },
  { field: 'area', label: 'Área', type: 'select_area', section: 'generales' },
  { field: 'tipo', label: 'Tipo', section: 'generales' },
  { field: 'fase', label: 'Fase', section: 'generales' },
  { field: 'fabricante', label: 'Fabricante', section: 'generales' },
  { field: 'modelo', label: 'Modelo', section: 'generales' },
  { field: 'numero_serie', label: 'N° Serie', section: 'generales' },
  { field: 'fecha_instalacion', label: 'Fecha Instalación', type: 'date', section: 'generales' },
  { field: 'estado_equipo', label: 'Estado', type: 'select_estado', section: 'generales' },

  // Jerarquía
  { field: 'activo_padre_id', label: 'Activo Padre', section: 'jerarquia' },
  { field: 'nivel_jerarquia', label: 'Nivel Jerarquía', type: 'number', section: 'jerarquia' },
  { field: 'tag', label: 'Tag Industrial', section: 'jerarquia' },
  { field: 'ubicacion_fisica', label: 'Ubicación Física', section: 'jerarquia' },
  { field: 'descripcion_larga', label: 'Descripción', section: 'jerarquia' },

  // Red
  { field: 'tipo_dispositivo', label: 'Tipo Dispositivo', section: 'red' },
  { field: 'ip', label: 'IP', section: 'red' },
  { field: 'puerto', label: 'Puerto', type: 'number', section: 'red' },
  { field: 'protocolo', label: 'Protocolo', section: 'red' },
  { field: 'usuario_red', label: 'Usuario Red', section: 'red' },
  { field: 'password_hash', label: 'Password', type: 'password', section: 'red' },

  // Monitoreo
  { field: 'endpoint', label: 'IP a monitorear', section: 'monitoreo' },
  { field: 'intervalo_segundos', label: 'Intervalo (segundos)', type: 'number', section: 'monitoreo' },
  { field: 'timeout_segundos', label: 'Timeout (segundos)', type: 'number', section: 'monitoreo' },
  { field: 'reintentos', label: 'Reintentos antes de fallo', type: 'number', section: 'monitoreo' },
];