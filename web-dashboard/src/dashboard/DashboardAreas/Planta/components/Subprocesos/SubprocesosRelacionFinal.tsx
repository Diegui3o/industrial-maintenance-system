import { useEffect, useState } from 'react';

import {
  getProcesos,
  getTodosSubprocesos,
  relacionarSubprocesosConProceso,
  type Proceso,
  type Subproceso,
} from '../../services/plantaApi';

export function SubprocesosRelacionFinal() {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([]);

  const [procesoId, setProcesoId] =
    useState<number | null>(null);

  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  useEffect(() => {
    let cancelado = false;

    const cargar = async () => {
      setLoading(true);

      try {
        const [
          procesosResultado,
          subprocesosResultado,
        ] = await Promise.all([
          getProcesos(),
          getTodosSubprocesos(),
        ]);

        if (cancelado) {
          return;
        }

        setProcesos(procesosResultado);
        setSubprocesos(subprocesosResultado);
      } catch (error) {
        console.error(
          'Error cargando relaciones de subprocesos:',
          error
        );
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!procesoId) {
      setSeleccionados([]);
      return;
    }

    const relacionados = subprocesos
      .filter(
        (subproceso) =>
          subproceso.proceso_id === procesoId
      )
      .map((subproceso) => subproceso.id);

    setSeleccionados(relacionados);
  }, [procesoId, subprocesos]);

  const cambiarSeleccion = (
    subprocesoId: number
  ) => {
    setSeleccionados((actuales) =>
      actuales.includes(subprocesoId)
        ? actuales.filter(
            (id) => id !== subprocesoId
          )
        : [...actuales, subprocesoId]
    );
  };

  const guardar = async () => {
    if (!procesoId) {
      return;
    }

    if (seleccionados.length === 0) {
      setMensaje(
        'Seleccione al menos un subproceso.'
      );
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await relacionarSubprocesosConProceso(
        procesoId,
        seleccionados
      );

      const actualizados =
        await getTodosSubprocesos();

      setSubprocesos(actualizados);

      setMensaje(
        'Relación guardada correctamente.'
      );
    } catch (error) {
      console.error(
        'Error guardando relación:',
        error
      );

      setMensaje(
        'No se pudo guardar la relación.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const procesoSeleccionado =
    procesos.find(
      (proceso) => proceso.id === procesoId
    );

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Subprocesos</h3>

          <p>
            Seleccione el proceso padre y luego
            los subprocesos que desea relacionar.
          </p>
        </div>
      </div>

      <div className="planta-form-grid">
        <label>
          <span>Proceso padre</span>

          <select
            value={procesoId ?? ''}
            onChange={(event) => {
              const value =
                event.target.value;

              setProcesoId(
                value
                  ? Number(value)
                  : null
              );

              setMensaje('');
            }}
          >
            <option value="">
              Seleccione un proceso
            </option>

            {procesos.map((proceso) => (
              <option
                key={proceso.id}
                value={proceso.id}
              >
                {proceso.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando subprocesos...
        </div>
      )}

      {!loading &&
        procesoSeleccionado && (
          <>
            <div className="planta-section-title">
              <div>
                <strong>
                  {procesoSeleccionado.nombre}
                </strong>

                <span>
                  Seleccione uno o varios
                  subprocesos
                </span>
              </div>

              <button
                type="button"
                className="planta-btn-primary"
                onClick={guardar}
                disabled={guardando}
              >
                {guardando
                  ? 'Guardando...'
                  : 'Guardar relación'}
              </button>
            </div>

            <div className="planta-list">
              {subprocesos.map(
                (subproceso) => (
                  <label
                    key={subproceso.id}
                    className="planta-list-item"
                  >
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(
                        subproceso.id
                      )}
                      onChange={() =>
                        cambiarSeleccion(
                          subproceso.id
                        )
                      }
                    />

                    <div>
                      <strong>
                        {subproceso.nombre}
                      </strong>

                      {subproceso.descripcion && (
                        <small>
                          {
                            subproceso.descripcion
                          }
                        </small>
                      )}
                    </div>
                  </label>
                )
              )}
            </div>

            {mensaje && (
              <div className="planta-alert">
                {mensaje}
              </div>
            )}
          </>
        )}
    </section>
  );
}