import { useMemo, useState } from 'react';

import type {
  SubprocesoSistemaPlanta,
} from '../../services/plantaApi';

interface Props {
  subprocesos: SubprocesoSistemaPlanta[];
  seleccionados: number[];
  onSeleccionadosChange: (
    ids: number[]
  ) => void;
}

export function SubprocesosSistemaTransferencia({
  subprocesos,
  seleccionados,
  onSeleccionadosChange,
}: Props) {
  const [seleccionado, setSeleccionado] =
    useState<number | null>(null);

  const [origen, setOrigen] =
    useState<
      'disponible' | 'asignado' | null
    >(null);

  const [busquedaDisponible, setBusquedaDisponible] =
    useState('');

  const [busquedaAsignado, setBusquedaAsignado] =
    useState('');

  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const disponibles = useMemo(
    () =>
      subprocesos.filter(
        (item) =>
          !seleccionados.includes(item.id)
      ),
    [subprocesos, seleccionados]
  );

  const asignados = useMemo(
    () =>
      subprocesos.filter((item) =>
        seleccionados.includes(item.id)
      ),
    [subprocesos, seleccionados]
  );

  const disponiblesFiltrados = useMemo(() => {
    const texto = normalizar(
      busquedaDisponible.trim()
    );

    if (!texto) {
      return disponibles;
    }

    return disponibles.filter((item) =>
      normalizar(
        [
          item.nombre,
          item.descripcion ?? '',
        ].join(' ')
      ).includes(texto)
    );
  }, [
    disponibles,
    busquedaDisponible,
  ]);

  const asignadosFiltrados = useMemo(() => {
    const texto = normalizar(
      busquedaAsignado.trim()
    );

    if (!texto) {
      return asignados;
    }

    return asignados.filter((item) =>
      normalizar(
        [
          item.nombre,
          item.descripcion ?? '',
        ].join(' ')
      ).includes(texto)
    );
  }, [
    asignados,
    busquedaAsignado,
  ]);

  const seleccionar = (
    id: number,
    tipo: 'disponible' | 'asignado'
  ) => {
    setSeleccionado(id);
    setOrigen(tipo);
  };

  const moverAAsignados = () => {
    if (
      seleccionado === null ||
      origen !== 'disponible'
    ) {
      return;
    }

    onSeleccionadosChange([
      ...seleccionados,
      seleccionado,
    ]);

    setSeleccionado(null);
    setOrigen(null);
  };

  const moverADisponibles = () => {
    if (
      seleccionado === null ||
      origen !== 'asignado'
    ) {
      return;
    }

    onSeleccionadosChange(
      seleccionados.filter(
        (id) => id !== seleccionado
      )
    );

    setSeleccionado(null);
    setOrigen(null);
  };

  return (
    <div className="planta-relation-transfer">
      <div className="planta-relation-transfer-panel">
        <div className="planta-relation-transfer-header">
          <div>
            <span className="planta-section-label">
              DISPONIBLES
            </span>

            <strong>
              Subprocesos de otros sistemas
            </strong>
          </div>

          <span className="planta-relation-count">
            {disponibles.length}
          </span>
        </div>

        <div className="planta-relation-search">
          <span>⌕</span>

          <input
            type="search"
            value={busquedaDisponible}
            onChange={(e) =>
              setBusquedaDisponible(
                e.target.value
              )
            }
            placeholder="Buscar subproceso..."
          />
        </div>

        <div className="planta-relation-transfer-list">
          {disponiblesFiltrados.length === 0 ? (
            <div className="planta-empty">
              {disponibles.length === 0
                ? 'No hay subprocesos disponibles.'
                : 'No se encontraron resultados.'}
            </div>
          ) : (
            disponiblesFiltrados.map(
              (item) => {
                const activo =
                  seleccionado === item.id &&
                  origen === 'disponible';

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      activo
                        ? 'planta-relation-transfer-item selected'
                        : 'planta-relation-transfer-item'
                    }
                    onClick={() =>
                      seleccionar(
                        item.id,
                        'disponible'
                      )
                    }
                  >
                    <span>
                      <strong>
                        {item.nombre}
                      </strong>

                      {item.descripcion && (
                        <small>
                          {item.descripcion}
                        </small>
                      )}
                    </span>

                    <span>›</span>
                  </button>
                );
              }
            )
          )}
        </div>
      </div>

      <div className="planta-relation-transfer-actions">
        <button
          type="button"
          className="planta-relation-transfer-action"
          onClick={moverAAsignados}
          disabled={
            seleccionado === null ||
            origen !== 'disponible'
          }
          title="Asignar subproceso"
        >
          →
        </button>

        <button
          type="button"
          className="planta-relation-transfer-action"
          onClick={moverADisponibles}
          disabled={
            seleccionado === null ||
            origen !== 'asignado'
          }
          title="Retirar subproceso"
        >
          ←
        </button>
      </div>

      <div className="planta-relation-transfer-panel">
        <div className="planta-relation-transfer-header">
          <div>
            <span className="planta-section-label">
              ASIGNADOS
            </span>

            <strong>
              Subprocesos del sistema
            </strong>
          </div>

          <span className="planta-relation-count">
            {asignados.length}
          </span>
        </div>

        <div className="planta-relation-search">
          <span>⌕</span>

          <input
            type="search"
            value={busquedaAsignado}
            onChange={(e) =>
              setBusquedaAsignado(
                e.target.value
              )
            }
            placeholder="Buscar subproceso..."
          />
        </div>

        <div className="planta-relation-transfer-list">
          {asignadosFiltrados.length === 0 ? (
            <div className="planta-empty">
              No hay subprocesos asignados.
            </div>
          ) : (
            asignadosFiltrados.map(
              (item) => {
                const activo =
                  seleccionado === item.id &&
                  origen === 'asignado';

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={
                      activo
                        ? 'planta-relation-transfer-item selected'
                        : 'planta-relation-transfer-item'
                    }
                    onClick={() =>
                      seleccionar(
                        item.id,
                        'asignado'
                      )
                    }
                  >
                    <span>
                      <strong>
                        {item.nombre}
                      </strong>

                      {item.descripcion && (
                        <small>
                          {item.descripcion}
                        </small>
                      )}
                    </span>

                    <span>›</span>
                  </button>
                );
              }
            )
          )}
        </div>
      </div>
    </div>
  );
}