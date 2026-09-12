import { useCallback, useEffect, useState } from 'react';

import {
  getProcesos,
  getTodosSubprocesos,
  relacionarSubprocesosConProceso,
  type Proceso,
  type Subproceso,
} from '../../services/plantaApi';

import { SubprocesoFormProceso } from './SubprocesoFormProceso';

export function SubprocesosProcesoPanel() {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([]);
  const [procesoId, setProcesoId] =
    useState<number | null>(null);
  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarForm, setMostrarForm] =
    useState(false);
  const [mensaje, setMensaje] = useState('');
  const [busqueda, setBusqueda] =
  useState('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);

    try {
      const [
        procesosResultado,
        subprocesosResultado,
      ] = await Promise.all([
        getProcesos(),
        getTodosSubprocesos(),
      ]);

      setProcesos(procesosResultado);
      setSubprocesos(subprocesosResultado);

      if (procesoId) {
        setSeleccionados(
          subprocesosResultado
            .filter(
              (item) =>
                item.proceso_id === procesoId
            )
            .map((item) => item.id)
        );
      }
    } catch (error) {
      console.error(
        'Error cargando procesos y subprocesos:',
        error
      );
    } finally {
      setLoading(false);
    }
  }, [procesoId]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const cambiarProceso = (id: string) => {
    const nuevoId = id ? Number(id) : null;

    setProcesoId(nuevoId);
    setMostrarForm(false);
    setMensaje('');

    if (!nuevoId) {
      setSeleccionados([]);
      return;
    }

    setSeleccionados(
      subprocesos
        .filter(
          (item) => item.proceso_id === nuevoId
        )
        .map((item) => item.id)
    );
  };

  const cambiarSeleccion = (id: number) => {
    setSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter((item) => item !== id)
        : [...actuales, id]
    );
  };

  const guardarRelacion = async () => {
    if (!procesoId) {
      setMensaje('Seleccione un proceso.');
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

      await cargarDatos();

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

  const procesoSeleccionado = procesos.find(
    (item) => item.id === procesoId
  );

  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const textoBusqueda =
    normalizar(busqueda);

  const subprocesosFiltrados =
    subprocesos.filter((subproceso) => {
      const texto = normalizar(
        [
          subproceso.nombre,
          subproceso.descripcion ?? '',
        ].join(' ')
      );

      return texto.includes(textoBusqueda);
    });

  return (
    <div>
      <div className="planta-form">
        <label>Proceso padre</label>

        <select
          value={procesoId ?? ''}
          onChange={(e) =>
            cambiarProceso(e.target.value)
          }
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
      </div>

      {procesoSeleccionado && (
        <div className="planta-relation-panel">
          <div className="planta-relation-header">
            <div>
              <span className="planta-section-label">
                PROCESO
              </span>

              <h3>
                {procesoSeleccionado.nombre}
              </h3>

              <p>
                Seleccione los subprocesos que
                pertenecen a este proceso.
              </p>
            </div>

            <button
              type="button"
              className="planta-add-btn"
              onClick={() =>
                setMostrarForm(true)
              }
            >
              + Nuevo
            </button>
          </div>

          {mostrarForm && (
            <SubprocesoFormProceso
              procesoId={procesoId!}
              onCancel={() =>
                setMostrarForm(false)
              }
              onSaved={async () => {
                setMostrarForm(false);
                await cargarDatos();
              }}
            />
          )}

          <div className="planta-relation-summary">
            <span>Subprocesos</span>

            <strong>
              {seleccionados.length}
            </strong>

            <span>seleccionados</span>
          </div>

          {loading && (
            <div className="planta-empty">
              Cargando subprocesos...
            </div>
          )}

          {!loading && (
            <>
              <div className="planta-relation-search">
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(e.target.value)
                  }
                  placeholder="Buscar subproceso..."
                />
              </div>
              <div className="planta-relation-grid">
                {subprocesosFiltrados.map(
                  (subproceso) => {
                    const seleccionado =
                      seleccionados.includes(
                        subproceso.id
                      );

                    const relacionado =
                      subproceso.proceso_id ===
                      procesoId;

                    return (
                      <label
                        key={subproceso.id}
                        className={`planta-relation-item ${
                          seleccionado
                            ? 'selected'
                            : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() =>
                            cambiarSeleccion(
                              subproceso.id
                            )
                          }
                        />

                        <div className="planta-relation-content">
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

                          <span
                            className={`planta-status ${
                              relacionado
                                ? 'linked'
                                : 'available'
                            }`}
                          >
                            {relacionado
                              ? 'Relacionado'
                              : 'Disponible'}
                          </span>
                        </div>
                      </label>
                    );
                  }
                )}
              </div>

              {subprocesos.length === 0 && (
                <div className="planta-empty">
                  No hay subprocesos registrados.
                </div>
              )}

              <div className="planta-relation-actions">
                <button
                  type="button"
                  className="planta-save-btn"
                  onClick={guardarRelacion}
                  disabled={guardando}
                >
                  {guardando
                    ? 'Guardando...'
                    : 'Guardar relación'}
                </button>
              </div>
            </>
          )}

          {mensaje && (
            <div className="planta-alert">
              {mensaje}
            </div>
          )}
        </div>
      )}
    </div>
  );
}