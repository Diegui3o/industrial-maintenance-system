import { request } from './plantaRequest';

export interface MaestroMotorElectrico {
  componente_id: number;

  // Identificación
  codigo_interno: string | null;
  codigo_sap: string | null;
  tipo_componente: string | null;
  nombre_componente: string | null;
  tag: string | null;
  placa_motor: string | null;
  fecha_actualizacion: string | null;

  // Datos generales
  zona: string | null;
  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;

  // Datos técnicos
  kw: number | null;
  hp: number | null;
  volt: string | null;
  amp: string | null;
  rpm: number | null;

  frame: string | null;
  fs: number | null;
  fp: number | null;
  clase: string | null;
  duty: string | null;
  eff: number | null;

  // Arranque
  tipo_arranque: string | null;

  // Rodamientos
  rodamiento_de: string | null;
  rodamiento_nde: string | null;
}

export async function getMaestrosMotoresElectricos(): Promise<
  MaestroMotorElectrico[]
> {
  return request<MaestroMotorElectrico[]>(
    '/planta/maestros-componentes/motores-electricos',
  );
}