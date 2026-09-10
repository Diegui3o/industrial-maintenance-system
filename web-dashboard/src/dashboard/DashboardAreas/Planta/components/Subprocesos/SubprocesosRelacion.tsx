import {
  useEffect,
  useState,
} from 'react';

import {
  actualizarSubproceso,
  getTodosSubprocesos,
  type Subproceso,
} from '../../services/plantaApi';

interface Props {
  procesoId: number;
  procesoNombre: string;
  onSaved?: () => void;
}

export function SubprocesosRelacion({
  procesoId,
  procesoNombre,
  onSaved,
}: Props) {
  const [
    subprocesos,
    setSubprocesos,
  ] = useState<Subproceso[]>([]);

  const [
    seleccionados,
    setSeleccionados,
  ] = useState<number[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);

      try {
        const resultado =
          await getTodosSubprocesos();

        if (!activo) {
          return;
        }

        setSubprocesos(resultado);

        setSeleccionados(
          resultado
            .filter(
              (item) =>
                item.proceso_id ===
                procesoId
            )
            .map(
              (item) => item.id
            )
        );
      } catch (error) {
        if (!activo) {
          return;
        }

        console.error(
          'Error cargando subprocesos:',
          error
        );

        setSubprocesos([]);
        setSeleccionados([]);
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [procesoId]);

  const cambiarSeleccion = (
    id: number
  ) => {
    setSeleccionados(
      (actuales) => {
        if (
          actuales.includes(id)
        ) {
          return actuales.filter(
            (item) => item !== id
          );
        }

        return [
          ...actuales,
          id,
        ];
      }
    );
  };

  const seleccionarTodos = () => {
    setSeleccionados(
      subprocesos.map(
        (item) => item.id
      )
    );
  };

  const quitarTodos = () => {
    setSeleccionados([]);
  };

  const guardarRelacion = async () => {
    if (guardando) {
      return;
    }

    setGuardando(true);

    try {
      /*
       * Solo modificamos los subprocesos
       * cuya relación cambia.
       */

      const seleccionadosSet =
        new Set(seleccionados);

      const actualesDelProceso =
        subprocesos.filter(
          (item) =>
            item.proceso_id ===
            procesoId
        );

      const actualesSet =
        new Set(
          actualesDelProceso.map(
            (item) => item.id
          )
        );

      const agregar =
        subprocesos.filter(
          (item) =>
            seleccionadosSet.has(
              item.id
            ) &&
            !actualesSet.has(
              item.id
            )
        );

      /*
       * Por ahora no se desasignan hijos.
       *
       * El modelo actual exige proceso_id
       * y actualizarSubproceso recibe
       * proceso_id obligatorio.
       *
       * Primero guardamos las nuevas
       * relaciones.
       */

      for (
        const subproceso of agregar
      ) {
        await actualizarSubproceso(
          subproceso.id,
          {
            proceso_id: procesoId,
            nombre:
              subproceso.nombre,
            descripcion:
              subproceso.descripcion,
            activo:
              subproceso.activo,
          }
        );
      }

      alert(
        'Relación guardada correctamente.'
      );

      onSaved?.();

      /*
       * Recargamos para reflejar
       * inmediatamente el estado real.
       */
      const actualizado =
        await getTodosSubprocesos();

      setSubprocesos(
        actualizado
      );

      setSeleccionados(
        actualizado
          .filter(
            (item) =>
              item.proceso_id ===
              procesoId
          )
          .map(
            (item) => item.id
          )
      );
    } catch (error) {
      console.error(
        'Error guardando relación:',
        error
      );

      alert(
        'No se pudo guardar la relación.'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="planta-empty">
        Cargando subprocesos...
      </div>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h4>
            Subprocesos
          </h4>

          <p>
            Proceso padre:{' '}
            <strong>
              {procesoNombre}
            </strong>
          </p>
        </div>
      </div>

      {subprocesos.length === 0 && (
        <div className="planta-alert warning">
          <strong>
            No existen subprocesos
          </strong>

          <span>
            Primero cree subprocesos.
          </span>
        </div>
      )}

      {subprocesos.length > 0 && (
        <>
          <div className="planta-form-actions">
            <button
              type="button"
              className="planta-add-btn"
              onClick={
                seleccionarTodos
              }
            >
              Seleccionar todos
            </button>

            <button
              type="button"
              className="planta-cancel-btn"
              onClick={
                quitarTodos
              }
            >
              Quitar todos
            </button>
          </div>

          <div className="planta-list">
            {subprocesos.map(
              (subproceso) => {
                const seleccionado =
                  seleccionados.includes(
                    subproceso.id
                  );

                const pertenece =
                  subproceso.proceso_id ===
                  procesoId;

                return (
                  <label
                    key={
                      subproceso.id
                    }
                    className="planta-list-item"
                    style={{
                      cursor:
                        'pointer',
                    }}
                  >
                    <div
                      className="planta-list-main"
                    >
                      <input
                        type="checkbox"
                        checked={
                          seleccionado
                        }
                        onChange={() =>
                          cambiarSeleccion(
                            subproceso.id
                          )
                        }
                      />

                      <div>
                        <strong>
                          {
                            subproceso.nombre
                          }
                        </strong>

                        {subproceso.descripcion && (
                          <small>
                            {
                              subproceso.descripcion
                            }
                          </small>
                        )}

                        {pertenece && (
                          <small>
                            Ya relacionado
                          </small>
                        )}
                      </div>
                    </div>
                  </label>
                );
              }
            )}
          </div>

          <div className="planta-alert">
            <strong>
              {seleccionados.length}
            </strong>

            <span>
              {' '}
              subproceso(s)
              seleccionado(s).
            </span>
          </div>

          <div className="planta-form-actions">
            <button
              type="button"
              className="planta-save-btn"
              onClick={
                guardarRelacion
              }
              disabled={
                guardando
              }
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar relación'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
