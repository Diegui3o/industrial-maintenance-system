import type {
  MaestroGeneralItem,
} from '../../../services/plantaMasterGeneralApi';

import type {
  ColumnaFiltro,
  FiltrosColumnas,
} from '../types/maestroGeneralTypes';

import {
  obtenerValoresUnicos,
  textoMostrar,
} from '../utils/maestroGeneralUtils';

import { FiltroColumnaExcel } from './filtros/FiltroColumnaExcel';

import { MaestroGeneralAcciones } from './MaestroGeneralAcciones';

interface MaestroGeneralTablaProps {
  datos: MaestroGeneralItem[];

  todosLosDatos: MaestroGeneralItem[];

  filtrosColumnas: FiltrosColumnas;

  onToggleFiltroColumna: (
    columna: ColumnaFiltro,
  ) => void;

  onBusquedaColumnaChange: (
    columna: ColumnaFiltro,
    valor: string,
  ) => void;

  onToggleValorColumna: (
    columna: ColumnaFiltro,
    valor: string,
  ) => void;

  onOrdenarColumna: (
    columna: ColumnaFiltro,
    orden: 'asc' | 'desc',
  ) => void;

  onLimpiarFiltroColumna: (
    columna: ColumnaFiltro,
  ) => void;

  onMantenimiento?: (
    item: MaestroGeneralItem,
  ) => void;

  onDetalleTecnico?: (
    item: MaestroGeneralItem,
  ) => void;
}

interface ColumnaProps {
  titulo: string;
  columna: ColumnaFiltro;
  valores: string[];
  filtrosColumnas: FiltrosColumnas;

  onToggleFiltroColumna: (
    columna: ColumnaFiltro,
  ) => void;

  onBusquedaColumnaChange: (
    columna: ColumnaFiltro,
    valor: string,
  ) => void;

  onToggleValorColumna: (
    columna: ColumnaFiltro,
    valor: string,
  ) => void;

  onOrdenarColumna: (
    columna: ColumnaFiltro,
    orden: 'asc' | 'desc',
  ) => void;

  onLimpiarFiltroColumna: (
    columna: ColumnaFiltro,
  ) => void;
}

function EncabezadoColumna({
  titulo,
  columna,
  valores,
  filtrosColumnas,
  onToggleFiltroColumna,
  onBusquedaColumnaChange,
  onToggleValorColumna,
  onOrdenarColumna,
  onLimpiarFiltroColumna,
}: ColumnaProps) {
  const filtro =
    filtrosColumnas[columna];

  return (
    <th>
      <div className="maestro-general-th-contenido">
        <span>{titulo}</span>

        <FiltroColumnaExcel
          abierto={filtro.abierto}
          valores={valores}
          seleccionados={
            filtro.seleccionados
          }
          busqueda={
            filtro.busqueda
          }
          orden={filtro.orden}
          onToggle={() =>
            onToggleFiltroColumna(
              columna,
            )
          }
          onBusquedaChange={(
            valor,
          ) =>
            onBusquedaColumnaChange(
              columna,
              valor,
            )
          }
          onToggleValor={(valor) =>
            onToggleValorColumna(
              columna,
              valor,
            )
          }
          onOrdenar={(orden) =>
            onOrdenarColumna(
              columna,
              orden,
            )
          }
          onLimpiar={() =>
            onLimpiarFiltroColumna(
              columna,
            )
          }
        />
      </div>
    </th>
  );
}

export function MaestroGeneralTabla({
  datos,
  todosLosDatos,
  filtrosColumnas,
  onToggleFiltroColumna,
  onBusquedaColumnaChange,
  onToggleValorColumna,
  onOrdenarColumna,
  onLimpiarFiltroColumna,
  onMantenimiento,
  onDetalleTecnico,
}: MaestroGeneralTablaProps) {
  const valoresFase =
    obtenerValoresUnicos(
      todosLosDatos,
      'fase',
    );

  const valoresProceso =
    obtenerValoresUnicos(
      todosLosDatos,
      'proceso',
    );

  const valoresSubproceso =
    obtenerValoresUnicos(
      todosLosDatos,
      'subproceso',
    );

  const valoresEquipo =
    obtenerValoresUnicos(
      todosLosDatos,
      'equipo',
    );

  const valoresComponente =
    obtenerValoresUnicos(
      todosLosDatos,
      'componente',
    );

  const valoresRepuesto =
    obtenerValoresUnicos(
      todosLosDatos,
      'repuesto',
    );

  if (datos.length === 0) {
    return (
      <div className="maestro-general-tabla-vacia">
        <div className="maestro-general-tabla-vacia-icono">
          🔎
        </div>

        <h3>
          No se encontraron resultados
        </h3>

        <p>
          No existen registros que
          coincidan con los filtros
          seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="maestro-general-tabla-wrapper">
      <table className="maestro-general-tabla">
        <thead>
          <tr>
            <EncabezadoColumna
              titulo="Fase"
              columna="fase"
              valores={valoresFase}
              filtrosColumnas={
                filtrosColumnas
              }
              onToggleFiltroColumna={
                onToggleFiltroColumna
              }
              onBusquedaColumnaChange={
                onBusquedaColumnaChange
              }
              onToggleValorColumna={
                onToggleValorColumna
              }
              onOrdenarColumna={
                onOrdenarColumna
              }
              onLimpiarFiltroColumna={
                onLimpiarFiltroColumna
              }
            />

            <EncabezadoColumna
              titulo="Proceso"
              columna="proceso"
              valores={valoresProceso}
              filtrosColumnas={
                filtrosColumnas
              }
              onToggleFiltroColumna={
                onToggleFiltroColumna
              }
              onBusquedaColumnaChange={
                onBusquedaColumnaChange
              }
              onToggleValorColumna={
                onToggleValorColumna
              }
              onOrdenarColumna={
                onOrdenarColumna
              }
              onLimpiarFiltroColumna={
                onLimpiarFiltroColumna
              }
            />

            <EncabezadoColumna
              titulo="Subproceso"
              columna="subproceso"
              valores={valoresSubproceso}
              filtrosColumnas={
                filtrosColumnas
              }
              onToggleFiltroColumna={
                onToggleFiltroColumna
              }
              onBusquedaColumnaChange={
                onBusquedaColumnaChange
              }
              onToggleValorColumna={
                onToggleValorColumna
              }
              onOrdenarColumna={
                onOrdenarColumna
              }
              onLimpiarFiltroColumna={
                onLimpiarFiltroColumna
              }
            />

            <EncabezadoColumna
              titulo="Equipo"
              columna="equipo"
              valores={valoresEquipo}
              filtrosColumnas={
                filtrosColumnas
              }
              onToggleFiltroColumna={
                onToggleFiltroColumna
              }
              onBusquedaColumnaChange={
                onBusquedaColumnaChange
              }
              onToggleValorColumna={
                onToggleValorColumna
              }
              onOrdenarColumna={
                onOrdenarColumna
              }
              onLimpiarFiltroColumna={
                onLimpiarFiltroColumna
              }
            />

            <EncabezadoColumna
              titulo="Componente"
              columna="componente"
              valores={valoresComponente}
              filtrosColumnas={
                filtrosColumnas
              }
              onToggleFiltroColumna={
                onToggleFiltroColumna
              }
              onBusquedaColumnaChange={
                onBusquedaColumnaChange
              }
              onToggleValorColumna={
                onToggleValorColumna
              }
              onOrdenarColumna={
                onOrdenarColumna
              }
              onLimpiarFiltroColumna={
                onLimpiarFiltroColumna
              }
            />

            <EncabezadoColumna
              titulo="Repuesto"
              columna="repuesto"
              valores={valoresRepuesto}
              filtrosColumnas={
                filtrosColumnas
              }
              onToggleFiltroColumna={
                onToggleFiltroColumna
              }
              onBusquedaColumnaChange={
                onBusquedaColumnaChange
              }
              onToggleValorColumna={
                onToggleValorColumna
              }
              onOrdenarColumna={
                onOrdenarColumna
              }
              onLimpiarFiltroColumna={
                onLimpiarFiltroColumna
              }
            />

            <th>
              <div className="maestro-general-th-contenido">
                Programa de mantenimiento
              </div>
            </th>

            <th>
              <div className="maestro-general-th-contenido">
                Detalle técnico
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {datos.map(
            (item, index) => (
              <tr
                key={`${item.equipo_id}-${item.componente_id}-${index}`}
              >
                <td>
                  {textoMostrar(
                    item.fase,
                  )}
                </td>

                <td>
                  {textoMostrar(
                    item.proceso,
                  )}
                </td>

                <td>
                  {textoMostrar(
                    item.subproceso,
                  )}
                </td>

                <td>
                  <div className="maestro-general-equipo">
                    {item.equipo_codigo && (
                      <strong>
                        {
                          item.equipo_codigo
                        }
                      </strong>
                    )}

                    {item.equipo_nombre && (
                      <span>
                        {
                          item.equipo_nombre
                        }
                      </span>
                    )}

                    {!item.equipo_codigo &&
                      !item.equipo_nombre && (
                        <span>
                          —
                        </span>
                      )}
                  </div>
                </td>

                <td>
                  <div className="maestro-general-componente">
                    {item.componente_codigo && (
                      <strong>
                        {
                          item.componente_codigo
                        }
                      </strong>
                    )}

                    {item.componente_tag && (
                      <span>
                        TAG:{' '}
                        {
                          item.componente_tag
                        }
                      </span>
                    )}

                    {item.componente_nombre && (
                      <span>
                        {
                          item.componente_nombre
                        }
                      </span>
                    )}

                    {!item.componente_codigo &&
                      !item.componente_tag &&
                      !item.componente_nombre && (
                        <span>
                          —
                        </span>
                      )}
                  </div>
                </td>

                <td>
                  {textoMostrar(
                    item.repuesto_nombre,
                  )}
                </td>

                <td>
                  <MaestroGeneralAcciones
                    tipo="mantenimiento"
                    onClick={() =>
                      onMantenimiento?.(item)
                    }
                  />
                </td>

                <td>
                  <MaestroGeneralAcciones
                    tipo="tecnico"
                    onClick={() =>
                      onDetalleTecnico?.(item)
                    }
                  />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}