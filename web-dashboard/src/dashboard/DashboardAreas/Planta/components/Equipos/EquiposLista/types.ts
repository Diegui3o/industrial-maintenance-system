export interface FilaEquipo {
  equipoId: number;
  fase: string;
  nombre: string;
  subproceso: string;
  componente: string;
  estado: string;
}

export const COLUMNAS = [
  { key: "fase", label: "Fase" },
  { key: "nombre", label: "Nombre" },
  { key: "subproceso", label: "Subproceso" },
  { key: "componente", label: "Componente" },
  { key: "estado", label: "Estado" },
] as const;

export type ColumnaKey = (typeof COLUMNAS)[number]["key"];
export type FiltrosState = Partial<Record<ColumnaKey, Set<string>>>;
