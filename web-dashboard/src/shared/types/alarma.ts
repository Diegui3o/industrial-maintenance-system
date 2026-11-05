export interface Alarma {
  id: number;
  equipo_id: number;
  componente_id: number | null;
  repuesto_id: number | null;
  tag_id: number | null;
  parametro: string | null;
  activo_tipo: 'equipo' | 'componente' | 'repuesto';
  tipo: string;
  mensaje: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  estado: 'activa' | 'atendida' | 'cerrada';
  fecha_generada: string;
  fecha_cierre: string | null;
}
