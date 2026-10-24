import type { FilaEquipo } from "../types";

interface Props {
  filasFiltradas: FilaEquipo[];
  totalEquipos: number;
  onLimpiarFiltros: () => void;
}

export function EquiposListaHeader({
  filasFiltradas,
  totalEquipos,
  onLimpiarFiltros,
}: Props) {
  return (
    <div className="planta-lista-header">
      <div className="planta-lista-header-info">
        <h2>Catálogo de equipos</h2>
        <p>
          {filasFiltradas.length} registro{filasFiltradas.length === 1 ? '' : 's'} · {totalEquipos} equipo{totalEquipos === 1 ? '' : 's'}
        </p>
      </div>

      <div className="planta-lista-header-actions">
        <button
          type="button"
          className="planta-lista-btn-secundario"
          onClick={onLimpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
