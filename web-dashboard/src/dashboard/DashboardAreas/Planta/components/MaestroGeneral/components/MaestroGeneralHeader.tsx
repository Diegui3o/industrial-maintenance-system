interface MaestroGeneralHeaderProps {
  cantidadTotal: number;
  cantidadVisible: number;
  cantidadFiltrosActivos: number;
  onLimpiarFiltros: () => void;
}

export function MaestroGeneralHeader({
  cantidadTotal,
  cantidadVisible,
  cantidadFiltrosActivos,
  onLimpiarFiltros,
}: MaestroGeneralHeaderProps) {
  return (
    <header className="maestro-general-header">
      <div className="maestro-general-header-info">
        <div className="maestro-general-header-titulo">
          <h2>Master principal</h2>

          <span className="maestro-general-header-registros">
            {cantidadVisible}
            {cantidadVisible !== cantidadTotal &&
              ` / ${cantidadTotal}`}
            {' '}
            {cantidadVisible === 1
              ? 'registro'
              : 'registros'}
          </span>
        </div>

        <p>
          Vista consolidada de la estructura de planta y sus componentes.
        </p>
      </div>

      {cantidadFiltrosActivos > 0 && (
        <button
          type="button"
          className="maestro-general-limpiar-filtros"
          onClick={onLimpiarFiltros}
        >
          Limpiar filtros
          <span>×</span>
        </button>
      )}
    </header>
  );
}