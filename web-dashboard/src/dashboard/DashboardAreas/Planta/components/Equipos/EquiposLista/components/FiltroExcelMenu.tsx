import type { ColumnaKey } from '../types';

interface Props {
  columnaKey: ColumnaKey;
  valores: string[];
  seleccionados?: Set<string>;
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  onSeleccionarValor: (valor: string) => void;
  onSeleccionarTodos: () => void;
  onCerrar: () => void;
  onBorrarFiltro: () => void;
  posicion: { top: number; left: number };
}

export function FiltroExcelMenu({
  valores,
  seleccionados,
  busqueda,
  onBusquedaChange,
  onSeleccionarValor,
  onSeleccionarTodos,
  onCerrar,
  onBorrarFiltro,
  posicion,
}: Props) {
  const valoresVisibles = valores.filter((v) =>
    v.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div
      className="planta-excel-menu"
      style={{ top: posicion.top, left: posicion.left }}
    >
      <div className="planta-excel-menu-search">
        <input
          type="search"
          autoFocus
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder="Buscar..."
        />
      </div>

      <button
        type="button"
        className="planta-excel-todos"
        onClick={onSeleccionarTodos}
      >
        ☑ Seleccionar todo
      </button>

      <div className="planta-excel-valores">
        {valoresVisibles.map((valor) => {
          const marcado = !seleccionados || seleccionados.has(valor);
          return (
            <label key={valor} className="planta-excel-valor">
              <input
                type="checkbox"
                checked={marcado}
                onChange={() => onSeleccionarValor(valor)}
              />
              <span>{valor}</span>
            </label>
          );
        })}
      </div>

      <div className="planta-excel-menu-footer">
        <button type="button" onClick={onCerrar}>
          Aceptar
        </button>
        <button type="button" onClick={onBorrarFiltro}>
          Borrar filtro
        </button>
      </div>
    </div>
  );
}