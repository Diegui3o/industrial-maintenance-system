export interface MotorElectricoMaestro {
  componente_id: number;

  descripcion_componente: string | null;
  tag: string | null;
  placa_motor: string | null;
  fecha_actualizacion: string | null;

  equipo_id: number | null;
  equipo_codigo: string | null;
  equipo_nombre: string | null;

  subproceso_id: number | null;
  subproceso_nombre: string | null;

  marca: string | null;
  modelo: string | null;
  numero_serie: string | null;

  kw: number | null;
  hp: number | null;

  volt: number | null;
  amp: number | null;
  rpm: number | null;

  frame: string | null;

  fs: number | null;
  fp: number | null;

  clase: string | null;
  duty: string | null;
  eff: number | null;

  lado_polea: string | null;
  codigo_sap_polea: string | null;

  lado_ventilador: string | null;
  codigo_sap_ventilador: string | null;

  tipo_arranque: string | null;
  marca_arranque: string | null;
  modelo_arranque: string | null;
}