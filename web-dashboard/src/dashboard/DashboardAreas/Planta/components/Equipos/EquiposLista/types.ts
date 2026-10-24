export interface FilaEquipo {
  equipoId: number;
  codigo: string;
  nombre: string;
  area: string;
  componente: string;
  estado: string;
}

export const COLUMNAS = [
  { key: "codigo", label: "Código" },
  { key: "nombre", label: "Nombre" },
  { key: "area", label: "Área" },
  { key: "componente", label: "Componente" },
  { key: "estado", label: "Estado" },
] as const;

export type ColumnaKey = (typeof COLUMNAS)[number]["key"];
export type FiltrosState = Partial<Record<ColumnaKey, Set<string>>>;