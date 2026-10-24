import { useNavigate } from "react-router-dom";
import { COLUMNAS, type FilaEquipo, type ColumnaKey, type FiltrosState } from "../types";
import { FiltroExcelMenu } from "./FiltroExcelMenu";

interface Props {
  filasFiltradas: FilaEquipo[];
  valoresPorColumna: Record<ColumnaKey, string[]>;
  filtros: FiltrosState;
  filtroAbierto: ColumnaKey | null;
  busquedaFiltro: string;
  posicionFiltro: { top: number; left: number };
  menuFilaClave: string | null;
  onAbrirFiltro: (columna: ColumnaKey, e: React.MouseEvent<HTMLButtonElement>) => void;
  onBusquedaFiltroChange: (val: string) => void;
  onSeleccionarValor: (columna: ColumnaKey, valor: string) => void;
  onSeleccionarTodos: (columna: ColumnaKey) => void;
  onCerrarFiltro: () => void;
  onMenuFilaToggle: (clave: string | null) => void;
  onAbrirCambioEstado: (fila: FilaEquipo, estado: string) => void;
}

export function EquiposTabla({
  filasFiltradas,
  valoresPorColumna,
  filtros,
  filtroAbierto,
  busquedaFiltro,
  posicionFiltro,
  menuFilaClave,
  onAbrirFiltro,
  onBusquedaFiltroChange,
  onSeleccionarValor,
  onSeleccionarTodos,
  onCerrarFiltro,
  onMenuFilaToggle,
  onAbrirCambioEstado,
}: Props) {
  const navigate = useNavigate();

  function estaFiltrado(columna: ColumnaKey) {
    return Boolean(filtros[columna] && filtros[columna]!.size > 0);
  }

  return (
    <div className="planta-table-wrapper planta-equipos-table-wrapper">
      <table className="planta-table planta-equipos-table">
        <thead>
          <tr>
            {COLUMNAS.map((columna) => {
              const valores = valoresPorColumna[columna.key] ?? [];
              const seleccion = filtros[columna.key];

              return (
                <th key={columna.key} className="planta-excel-th">
                  <button
                    type="button"
                    className={`planta-excel-filtro ${
                      estaFiltrado(columna.key) ? "filtrado" : ""
                    }`}
                    onClick={(e) => onAbrirFiltro(columna.key, e)}
                  >
                    <span>{columna.label}</span>
                    <span>▼</span>
                  </button>

                  {filtroAbierto === columna.key && (
                    <FiltroExcelMenu
                      columnaKey={columna.key}
                      valores={valores}
                      seleccionados={seleccion}
                      busqueda={busquedaFiltro}
                      onBusquedaChange={onBusquedaFiltroChange}
                      onSeleccionarValor={(val) => onSeleccionarValor(columna.key, val)}
                      onSeleccionarTodos={() => onSeleccionarTodos(columna.key)}
                      onCerrar={onCerrarFiltro}
                      onBorrarFiltro={() => {
                        onSeleccionarTodos(columna.key);
                        onCerrarFiltro();
                      }}
                      posicion={posicionFiltro}
                    />
                  )}
                </th>
              );
            })}

            <th className="planta-excel-th planta-equipos-opciones-th">
              <span className="planta-equipos-opciones-titulo">Opciones</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {filasFiltradas.length === 0 ? (
            <tr>
              <td colSpan={COLUMNAS.length + 1} className="planta-table-empty">
                No se encontraron equipos.
              </td>
            </tr>
          ) : (
            filasFiltradas.map((fila, index) => {
              const filaClave = `${fila.equipoId}-${fila.componente}-${index}`;

              return (
                <tr key={filaClave}>
                  <td className="planta-equipo-codigo">{fila.codigo}</td>
                  <td className="planta-equipo-nombre">{fila.nombre}</td>
                  <td>{fila.area}</td>
                  <td>{fila.componente}</td>
                  <td>
                    {fila.estado !== "-" ? (
                      <span
                        className={`planta-equipo-estado planta-equipo-estado-${fila.estado
                          .toLowerCase()
                          .replace(/\s+/g, "_")}`}
                      >
                        {fila.estado}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td className="planta-equipos-opciones">
                    <div className="planta-equipos-opciones-grupo">
                      <button
                        type="button"
                        className="planta-equipo-opcion planta-equipo-opcion-ver"
                        onClick={() => navigate(`/equipos/${fila.equipoId}`)}
                      >
                        Ver
                      </button>

                      <button
                        type="button"
                        className="planta-equipo-opcion planta-equipo-opcion-editar"
                        onClick={() => navigate(`/equipos/${fila.equipoId}/editar`)}
                      >
                        Editar
                      </button>

                      <div className="planta-equipos-opciones-wrap" style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className="planta-equipo-opcion planta-equipo-opcion-estado"
                          onClick={() =>
                            onMenuFilaToggle(menuFilaClave === filaClave ? null : filaClave)
                          }
                        >
                          Estado
                          <span>▾</span>
                        </button>

                        {menuFilaClave === filaClave && (
                          <div className="planta-equipo-estado-menu">
                            <button type="button" onClick={() => onAbrirCambioEstado(fila, "activo")}>
                              Activo
                            </button>
                            <button type="button" onClick={() => onAbrirCambioEstado(fila, "inactivo")}>
                              Inactivo
                            </button>
                            <button type="button" onClick={() => onAbrirCambioEstado(fila, "fallo")}>
                              Fallo
                            </button>
                            <button type="button" onClick={() => onAbrirCambioEstado(fila, "mantenimiento")}>
                              Mantenimiento
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}