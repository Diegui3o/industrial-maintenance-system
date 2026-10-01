import {
  useEffect,
  useMemo,
  useRef,
} from 'react';

interface FiltroColumnaExcelProps {
  abierto: boolean;
  valores: string[];
  seleccionados: string[];
  busqueda: string;
  orden:
    | 'asc'
    | 'desc'
    | null;

  onToggle: () => void;

  onBusquedaChange: (
    valor: string,
  ) => void;

  onToggleValor: (
    valor: string,
  ) => void;

  onOrdenar: (
    orden: 'asc' | 'desc',
  ) => void;

  onLimpiar: () => void;
}

export function FiltroColumnaExcel({
  abierto,
  valores,
  seleccionados,
  busqueda,
  orden,
  onToggle,
  onBusquedaChange,
  onToggleValor,
  onOrdenar,
  onLimpiar,
}: FiltroColumnaExcelProps) {
  const contenedorRef =
    useRef<HTMLDivElement>(
      null,
    );

  useEffect(() => {
    function manejarClickFuera(
      event: MouseEvent,
    ) {
      if (
        contenedorRef.current &&
        !contenedorRef.current.contains(
          event.target as Node,
        )
      ) {
        if (abierto) {
          onToggle();
        }
      }
    }

    document.addEventListener(
      'mousedown',
      manejarClickFuera,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        manejarClickFuera,
      );
    };
  }, [
    abierto,
    onToggle,
  ]);

  const valoresFiltrados =
    useMemo(() => {
      const texto =
        busqueda
          .toLowerCase()
          .normalize('NFD')
          .replace(
            /[\u0300-\u036f]/g,
            '',
          );

      return valores.filter(
        (valor) =>
          valor
            .toLowerCase()
            .normalize('NFD')
            .replace(
              /[\u0300-\u036f]/g,
              '',
            )
            .includes(texto),
      );
    }, [
      valores,
      busqueda,
    ]);

  const todosSeleccionados =
    valores.length > 0 &&
    valores.every(
      (valor) =>
        seleccionados.includes(
          valor,
        ),
    );

  function seleccionarTodos() {
    if (todosSeleccionados) {
      valores.forEach(
        (valor) => {
          if (
            seleccionados.includes(
              valor,
            )
          ) {
            onToggleValor(valor);
          }
        },
      );
    } else {
      valores.forEach(
        (valor) => {
          if (
            !seleccionados.includes(
              valor,
            )
          ) {
            onToggleValor(valor);
          }
        },
      );
    }
  }

  return (
    <div
      className="filtro-columna-excel"
      ref={contenedorRef}
    >
      <button
        type="button"
        className={`filtro-columna-excel-btn ${
          abierto
            ? 'active'
            : ''
        } ${
          seleccionados.length >
            0 ||
          orden !== null
            ? 'has-filter'
            : ''
        }`}
        onClick={onToggle}
        aria-label="Abrir filtro"
        title="Filtrar columna"
      >
        ▾
      </button>

      {abierto && (
        <div className="filtro-columna-excel-menu">
          <div className="filtro-columna-excel-orden">
            <button
              type="button"
              onClick={() =>
                onOrdenar('asc')
              }
              className={
                orden === 'asc'
                  ? 'selected'
                  : ''
              }
            >
              <span>↑</span>
              A → Z
            </button>

            <button
              type="button"
              onClick={() =>
                onOrdenar('desc')
              }
              className={
                orden === 'desc'
                  ? 'selected'
                  : ''
              }
            >
              <span>↓</span>
              Z → A
            </button>
          </div>

          <div className="filtro-columna-excel-separador" />

          <input
            type="text"
            className="filtro-columna-excel-busqueda"
            value={busqueda}
            onChange={(event) =>
              onBusquedaChange(
                event.target.value,
              )
            }
            placeholder="Buscar..."
            autoFocus
          />

          <div className="filtro-columna-excel-separador" />

          <label className="filtro-columna-excel-todos">
            <input
              type="checkbox"
              checked={
                todosSeleccionados
              }
              onChange={
                seleccionarTodos
              }
            />

            <span>
              Seleccionar todo
            </span>
          </label>

          <div className="filtro-columna-excel-lista">
            {valoresFiltrados.length ===
              0 && (
              <div className="filtro-columna-excel-vacio">
                Sin resultados
              </div>
            )}

            {valoresFiltrados.map(
              (valor) => (
                <label
                  key={valor}
                  className="filtro-columna-excel-item"
                >
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(
                      valor,
                    )}
                    onChange={() =>
                      onToggleValor(
                        valor,
                      )
                    }
                  />

                  <span>
                    {valor || '—'}
                  </span>
                </label>
              ),
            )}
          </div>

          <div className="filtro-columna-excel-footer">
            <button
              type="button"
              onClick={onLimpiar}
            >
              Limpiar
            </button>

            <button
              type="button"
              className="filtro-columna-excel-aplicar"
              onClick={onToggle}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}