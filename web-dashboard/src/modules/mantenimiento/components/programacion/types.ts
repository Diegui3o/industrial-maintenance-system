export type Equipo = {
  id: number;
  codigo: string;
  nombre: string;
  fase?: string;
  area?: string;
  tipo?: string;
  ubicacion?: string;
};

export type Componente = {
  id: number;
  equipo_id?: number | null;
  codigo?: string | null;
  codigo_sap?: string | null;
  tag?: string | null;
  nombre: string;
  tipo_componente?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;
  descripcion?: string | null;
  activo?: boolean;
};

export type Props = {
  onCerrar: () => void;
  fechaProgramada?: string;
};