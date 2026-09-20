import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const [subprocesos, setSubprocesos] = useState<Subproceso[]>([]);
  const [procesoId, setProcesoId] = useState<number | null>(null);

  const [asignados, setAsignados] = useState<Subproceso[]>([]);
  const [disponibles, setDisponibles] = useState<Subproceso[]>([]);

  const [seleccionado, setSeleccionado] =
    useState<Subproceso | null>(null);

  const [origenSeleccionado, setOrigenSeleccionado] =
    useState<'disponible' | 'asignado' | null>(null);

  const [busquedaDisponible, setBusquedaDisponible] =
    useState('');

  const [busquedaAsignado, setBusquedaAsignado] =
    useState('');

  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const ordenar = (items: Subproceso[]) =>
    [...items].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es', {
        sensitivity: 'base',
      })
    );

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setMensaje('');

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
        const relacionados = subprocesosResultado.filter(
          (item) => item.proceso_id === procesoId
        );

        const noRelacionados = subprocesosResultado.filter(
          (item) => item.proceso_id !== procesoId
        );

        setAsignados(ordenar(relacionados));
        setDisponibles(ordenar(noRelacionados));
      } else {
        setAsignados([]);
        setDisponibles(ordenar(subprocesosResultado));
      }

      setSeleccionado(null);
      setOrigenSeleccionado(null);
    } catch (error) {
      console.error(
        'Error cargando procesos y subprocesos:',
        error
      );

      setProcesos([]);
      setSubprocesos([]);
      setAsignados([]);
      setDisponibles([]);
      setMensaje(
        'No se pudieron cargar los procesos y subprocesos.'
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
    setSeleccionado(null);
    setOrigenSeleccionado(null);
    setBusquedaDisponible('');
    setBusquedaAsignado('');

    if (!nuevoId) {
      setAsignados([]);
      setDisponibles(ordenar(subprocesos));
      return;
    }

    const relacionados = subprocesos.filter(
      (item) => item.proceso_id === nuevoId
    );

    const noRelacionados = subprocesos.filter(
      (item) => item.proceso_id !== nuevoId
    );

    setAsignados(ordenar(relacionados));
    setDisponibles(ordenar(noRelacionados));
  };

  const seleccionarSubproceso = (
    subproceso: Subproceso,
    origen: 'disponible' | 'asignado'
  ) => {
    setSeleccionado(subproceso);
    setOrigenSeleccionado(origen);
  };

  const moverAAsignados = () => {
    if (
      !seleccionado ||
      origenSeleccionado !== 'disponible'
    ) {
      return;
    }

    setDisponibles((actuales) =>
      actuales.filter(
        (item) => item.id !== seleccionado.id
      )
    );

    setAsignados((actuales) =>
      ordenar([...actuales, seleccionado])
    );

    setSeleccionado(null);
    setOrigenSeleccionado(null);
  };

  const moverADisponibles = () => {
    if (
      !seleccionado ||
      origenSeleccionado !== 'asignado'
    ) {
      return;
    }

    setAsignados((actuales) =>
      actuales.filter(
        (item) => item.id !== seleccionado.id
      )
    );

    setDisponibles((actuales) =>
      ordenar([...actuales, seleccionado])
    );

    setSeleccionado(null);
    setOrigenSeleccionado(null);
  };

  const guardarRelacion = async () => {
    if (!procesoId) {
      setMensaje('Seleccione un proceso.');
      return;
    }

    if (asignados.length === 0) {
      setMensaje(
        'Seleccione al menos un subproceso.'
      );
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      const ids = Array.from(
        new Set(asignados.map((item) => item.id))
      );

      await relacionarSubprocesosConProceso(
        procesoId,
        ids
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

  const disponiblesFiltrados = useMemo(() => {
    const texto = normalizar(
      busquedaDisponible.trim()
    );

    if (!texto) {
      return disponibles;
    }

    return disponibles.filter((subproceso) => {
      const contenido = normalizar(
        [
          subproceso.nombre,
          subproceso.descripcion ?? '',
        ].join(' ')
      );

      return contenido.includes(texto);
    });
  }, [disponibles, busquedaDisponible]);

  const asignadosFiltrados = useMemo(() => {
    const texto = normalizar(
      busquedaAsignado.trim()
    );

    if (!texto) {
      return asignados;
    }

    return asignados.filter((subproceso) => {
      const contenido = normalizar(
        [
          subproceso.nombre,
          subproceso.descripcion ?? '',
        ].join(' ')
      );

      return contenido.includes(texto);
    });
  }, [asignados, busquedaAsignado]);

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

          {loading && (
            <div className="planta-empty">
              Cargando subprocesos...
            </div>
          )}

          {!loading && (
            <>
              <div className="planta-relation-summary">
                <span>Subprocesos asignados</span>

                <strong>
                  {asignados.length}
                </strong>
              </div>

              <div className="planta-relation-transfer">
                {/* DISPONIBLES */}
                <div className="planta-relation-transfer-panel">
                  <div className="planta-relation-transfer-header">
                    <div>
                      <span className="planta-section-label">
                        DISPONIBLES
                      </span>

                      <strong>
                        Subprocesos de otros procesos
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
                        (subproceso) => {
                          const activo =
                            seleccionado?.id ===
                              subproceso.id &&
                            origenSeleccionado ===
                              'disponible';

                          return (
                            <button
                              type="button"
                              key={`disponible-${subproceso.id}`}
                              className={
                                activo
                                  ? 'planta-relation-transfer-item selected'
                                  : 'planta-relation-transfer-item'
                              }
                              onClick={() =>
                                seleccionarSubproceso(
                                  subproceso,
                                  'disponible'
                                )
                              }
                            >
                              <span>
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
                              </span>

                              <span>›</span>
                            </button>
                          );
                        }
                      )
                    )}
                  </div>
                </div>

                {/* ACCIONES */}
                <div className="planta-relation-transfer-actions">
                  <button
                    type="button"
                    className="planta-relation-transfer-action"
                    onClick={moverAAsignados}
                    disabled={
                      !seleccionado ||
                      origenSeleccionado !==
                        'disponible'
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
                      !seleccionado ||
                      origenSeleccionado !==
                        'asignado'
                    }
                    title="Quitar subproceso"
                  >
                    ←
                  </button>
                </div>

                {/* ASIGNADOS */}
                <div className="planta-relation-transfer-panel">
                  <div className="planta-relation-transfer-header">
                    <div>
                      <span className="planta-section-label">
                        ASIGNADOS
                      </span>

                      <strong>
                        Subprocesos del proceso
                      </strong>
                    </div>

                    <span className="planta-relation-count assigned">
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
                      placeholder="Buscar asignado..."
                    />
                  </div>

                  <div className="planta-relation-transfer-list">
                    {asignadosFiltrados.length === 0 ? (
                      <div className="planta-empty">
                        {asignados.length === 0
                          ? 'No hay subprocesos asignados.'
                          : 'No se encontraron resultados.'}
                      </div>
                    ) : (
                      asignadosFiltrados.map(
                        (subproceso) => {
                          const activo =
                            seleccionado?.id ===
                              subproceso.id &&
                            origenSeleccionado ===
                              'asignado';

                          return (
                            <button
                              type="button"
                              key={`asignado-${subproceso.id}`}
                              className={
                                activo
                                  ? 'planta-relation-transfer-item selected'
                                  : 'planta-relation-transfer-item'
                              }
                              onClick={() =>
                                seleccionarSubproceso(
                                  subproceso,
                                  'asignado'
                                )
                              }
                            >
                              <span>
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