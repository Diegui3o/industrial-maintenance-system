import { request } from './plantaRequest';

export interface ComponenteMotorElectrico {
  componente_id: number;

  placa_motor?: string | null;
  fabricante?: string | null;
  codigo_fabricante?: string | null;
  producto?: string | null;

  rated_voltage?: string | null;
  rated_current?: string | null;
  frequency?: number | null;
  phases?: number | null;
  power_factor?: number | null;
  efficiency?: number | null;
  service_factor?: number | null;
  output?: number | null;
  rated_speed?: number | null;

  number_of_poles?: number | null;
  design?: string | null;
  enclosure?: string | null;
  degree_of_protection?: string | null;
  frame?: string | null;
  mounting?: string | null;
  insulation_class?: string | null;
  duty_cycle?: string | null;

  slip?: number | null;
  rated_torque?: number | null;
  locked_rotor_torque?: number | null;
  breakdown_torque?: number | null;

  starting_method?: string | null;
  l_r_amperes?: string | null;
  lrc?: string | null;
  no_load_current?: string | null;
  locked_rotor_time?: string | null;
  rotation?: string | null;

  moment_of_inertia?: number | null;
  temperature_rise?: number | null;
  ambient_temperature?: string | null;
  altitude?: number | null;
  noise_level?: number | null;
  approximate_weight?: number | null;

  bearing_drive_end?: string | null;
  bearing_non_drive_end?: string | null;
  front_bearing?: string | null;
  rear_bearing?: string | null;

  connection?: string | null;
  standard?: string | null;
  nema_classification?: string | null;
  year_of_manufacture?: number | null;

  creado_en?: string | null;
  actualizado_en?: string | null;
}

export interface Componente {
  id: number;
  equipo_id: number | null;

  codigo?: string | null;
  codigo_sap?: string | null;
  tag?: string | null;
  nombre: string;

  tipo_componente?: string | null;

  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;

  descripcion?: string | null;
  activo: boolean;

  creado_en?: string | null;
  fecha_creacion?: string | null;
  fecha_actualizacion?: string | null;

  motor_electrico?: ComponenteMotorElectrico | null;
}

export interface CrearComponenteData {
  equipo_id: number;
  codigo?: string | null;
  codigo_sap?: string | null;
  tag?: string | null;
  nombre: string;
  tipo_componente: string;
  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;
  descripcion?: string | null;
  activo?: boolean;
  motor_electrico?: Omit<
    ComponenteMotorElectrico,
    'componente_id'
  >;
}

export interface ActualizarComponenteData
  extends CrearComponenteData {
  activo: boolean;
}

export async function getTodosComponentes(): Promise<
  Componente[]
> {
  return request<Componente[]>(
    '/planta/componentes'
  );
}

export async function getComponentes(
  equipoId: number
): Promise<Componente[]> {
  return request<Componente[]>(
    `/planta/equipos/${equipoId}/componentes`
  );
}

export async function crearComponente(
  data: CrearComponenteData
): Promise<Componente> {
  return request<Componente>(
    '/planta/componentes',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export async function actualizarComponente(
  id: number,
  data: ActualizarComponenteData
): Promise<void> {
  await request<void>(
    `/planta/componentes/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    }
  );
}

export async function getComponentesParaRelacionEquipo(
  equipoId: number
): Promise<Componente[]> {
  return request<Componente[]>(
    `/planta/equipos/${equipoId}/componentes-relacion`
  );
}

export interface RelacionComponente {
  componente_id: number;
  equipo_id: number | null;
}

export async function relacionarComponentesConEquipo(
  equipoId: number,
  relaciones: RelacionComponente[]
): Promise<void> {
  await request<void>(
    `/planta/equipos/${equipoId}/componentes-relacion`,
    {
      method: 'PUT',
      body: JSON.stringify({
        relaciones,
      }),
    }
  );
}