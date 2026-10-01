import { useEffect, useMemo, useState } from 'react';

import {
  getTodosComponentes,
  type Componente,
} from '../../services/plantaComponentesApi';

import {
  getEquipos,
  type Equipo,
} from '../../services/plantaEquiposApi';

interface Props {
  onCrear: () => void;
}

export function ComponentesCatalogo({
  onCrear,
}: Props) {
  const [componentes, setComponentes] =
    useState<Componente[]>([]);

  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [busqueda, setBusqueda] =
    useState('');

  const [tipoFiltro, setTipoFiltro] =
    useState('');

  const [equipoFiltro, setEquipoFiltro] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    let activo = true;

    Promise.all([
      getTodosComponentes(),
      getEquipos(),
    ])
      .then(
        ([
          componentesResultado,
          equiposResultado,
        ]) => {
          if (!activo) {
            return;
          }

          setComponentes(
            componentesResultado
          );

          setEquipos(
            equiposResultado
          );
        }
      )
      .catch((error) => {
        if (!activo) {
          return;
        }

        console.error(
          'Error cargando catálogo de componentes:',
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar el catálogo.'
        );
      })
      .finally(() => {
        if (activo) {
          setLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  const equipoPorId = useMemo(() => {
    const mapa = new Map<number, Equipo>();

    for (const equipo of equipos) {
      mapa.set(equipo.id, equipo);
    }

    return mapa;
  }, [equipos]);

  const tipos = useMemo<string[]>(() => {
    return Array.from(
      new Set(
        componentes
          .map(
            (componente) =>
              componente.tipo_componente
          )
          .filter(
            (tipo): tipo is string =>
              Boolean(tipo)
          )
      )
    ).sort();
  }, [componentes]);

  const componentesFiltrados =
    useMemo(() => {
      const texto =
        busqueda.trim().toLowerCase();

      return componentes.filter(
        (componente) => {
          const equipo =
            componente.equipo_id
              ? equipoPorId.get(
                  componente.equipo_id
                )
              : undefined;

          const contenido = [
            componente.codigo ?? '',
            componente.codigo_sap ?? '',
            componente.tag ?? '',
            componente.nombre ?? '',
            componente.tipo_componente ?? '',
            componente.marca ?? '',
            componente.modelo ?? '',
            componente.numero_serie ?? '',
            equipo?.codigo ?? '',
            equipo?.nombre ?? '',
          ]
            .join(' ')
            .toLowerCase();

          const coincideBusqueda =
            !texto ||
            contenido.includes(texto);

          const coincideTipo =
            !tipoFiltro ||
            componente.tipo_componente ===
              tipoFiltro;

          const coincideEquipo =
            !equipoFiltro ||
            String(
              componente.equipo_id ?? ''
            ) === equipoFiltro;

          return (
            coincideBusqueda &&
            coincideTipo &&
            coincideEquipo
          );
        }
      );
    }, [
      componentes,
      busqueda,
      tipoFiltro,
      equipoFiltro,
      equipoPorId,
    ]);

  return (
    <div className="componentes-catalogo">

      <div className="componentes-catalogo-toolbar">

        <div className="componentes-busqueda">
          <input
            type="text"
            value={busqueda}
            onChange={(event) =>
              setBusqueda(
                event.target.value
              )
            }
            placeholder="Buscar por SAP, TAG, nombre, marca, modelo o equipo..."
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(event) =>
            setTipoFiltro(
              event.target.value
            )
          }
        >
          <option value="">
            Todos los tipos
          </option>

          {tipos.map((tipo) => (
            <option
              key={tipo}
              value={tipo}
            >
              {tipo}
            </option>
          ))}
        </select>

        <select
          value={equipoFiltro}
          onChange={(event) =>
            setEquipoFiltro(
              event.target.value
            )
          }
        >
          <option value="">
            Todos los equipos
          </option>

          {equipos.map((equipo) => (
            <option
              key={equipo.id}
              value={equipo.id}
            >
              {equipo.codigo
                ? `${equipo.codigo} - `
                : ''}
              {equipo.nombre}
            </option>
          ))}
        </select>

      </div>

      {error && (
        <div className="componente-form-error">
          {error}
        </div>
      )}

      <div className="componentes-tabla">

        <div className="componentes-tabla-header">
          <span>Código SAP</span>
          <span>TAG</span>
          <span>Componente</span>
          <span>Tipo</span>
          <span>Equipo</span>
          <span>Estado</span>
          <span></span>
        </div>

        {loading && (
          <div className="componentes-empty">
            <div className="componentes-empty-icon">
              …
            </div>

            <strong>
              Cargando componentes
            </strong>

            <span>
              Consultando el catálogo registrado.
            </span>
          </div>
        )}

        {!loading &&
          componentesFiltrados.length === 0 && (
            <div className="componentes-empty">

              <div className="componentes-empty-icon">
                ⚙
              </div>

              <strong>
                {componentes.length === 0
                  ? 'No hay componentes registrados'
                  : 'No se encontraron componentes'}
              </strong>

              <span>
                {componentes.length === 0
                  ? 'Los componentes registrados aparecerán aquí.'
                  : 'Prueba cambiando la búsqueda o los filtros.'}
              </span>

              {componentes.length === 0 && (
                <button
                  type="button"
                  className="componentes-empty-btn"
                  onClick={onCrear}
                >
                  Crear primer componente
                </button>
              )}

            </div>
          )}

        {!loading &&
          componentesFiltrados.length > 0 &&
          componentesFiltrados.map(
            (componente) => {
              const equipo =
                componente.equipo_id
                  ? equipoPorId.get(
                      componente.equipo_id
                    )
                  : undefined;

              return (
                <div
                  key={componente.id}
                  className="componentes-tabla-row"
                >
                  <span>
                    {componente.codigo_sap ||
                      '—'}
                  </span>

                  <span>
                    {componente.tag ||
                      '—'}
                  </span>

                  <span>
                    <strong>
                      {componente.nombre}
                    </strong>

                    {(componente.marca ||
                      componente.modelo) && (
                      <small>
                        {[
                          componente.marca,
                          componente.modelo,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </small>
                    )}
                  </span>

                  <span>
                    {componente.tipo_componente ||
                      '—'}
                  </span>

                  <span>
                    {equipo ? (
                      <>
                        <strong>
                          {equipo.codigo ||
                            equipo.nombre}
                        </strong>

                        {equipo.codigo && (
                          <small>
                            {equipo.nombre}
                          </small>
                        )}
                      </>
                    ) : (
                      'Sin equipo'
                    )}
                  </span>

                  <span>
                    <span
                      className={
                        componente.activo
                          ? 'componente-estado activo'
                          : 'componente-estado inactivo'
                      }
                    >
                      {componente.activo
                        ? 'Activo'
                        : 'Inactivo'}
                    </span>
                  </span>

                  <span>
                    <button
                      type="button"
                      className="componente-row-action"
                      title="Ver componente"
                    >
                      ›
                    </button>
                  </span>
                </div>
              );
            }
          )}

      </div>

      {!loading &&
        componentesFiltrados.length > 0 && (
          <div className="componentes-catalogo-footer">
            <span>
              {componentesFiltrados.length}{' '}
              componente
              {componentesFiltrados.length === 1
                ? ''
                : 's'}
            </span>
          </div>
        )}

    </div>
  );
}