import type { FilaEquipo } from '../types';
import { exportarTablaExcel } from '../../../../utils/exportarExcel';

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
  function descargarExcel() {
    const datos = filasFiltradas.map((fila) => [
      fila.codigo,
      fila.nombre,
      fila.area,
      fila.componente,
      fila.estado,
    ]);

    exportarTablaExcel(
      "equipos_planta",
      ["Código", "Nombre", "Área", "Componente", "Estado"],
      datos
    );
  }

  return (
    <div className="planta-lista-header">
      <div>
        <h2>Catálogo de equipos</h2>
        <span>
          {filasFiltradas.length} registros · {totalEquipos} equipos
        </span>
      </div>

      <div className="planta-lista-acciones">
        <button
          type="button"
          className="planta-btn-excel"
          onClick={descargarExcel}
        >
          ↓ Excel
        </button>

        <button
          type="button"
          className="planta-lista-limpiar"
          onClick={onLimpiarFiltros}
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}