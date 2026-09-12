import { useCallback, useEffect, useState } from 'react';

import {
  crearSubprocesoSistema,
  getSistemas,
  getTodosSubprocesosSistema,
  relacionarSubprocesosConSistema,
  type SistemaPlanta,
  type SubprocesoSistemaPlanta,
} from '../../services/plantaApi';

export function SubprocesosSistemaPanel() {
  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [subprocesos, setSubprocesos] =
    useState<SubprocesoSistemaPlanta[]>([]);

  const [sistemaId, setSistemaId] =
    useState<number | null>(null);

  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  const [busqueda, setBusqueda] =
    useState('');

  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [nombreNuevo, setNombreNuevo] =
    useState('');

  const [descripcionNueva, setDescripcionNueva] =
    useState('');

  const cargarDatos = useCallback(async () => {
    setLoading(true);

    try {
      const [
        sistemasResultado,
        subprocesosResultado,
      ] = await Promise.all([
        getSistemas(),
        getTodosSubprocesosSistema(),
      ]);

      setSistemas(sistemasResultado);
      setSubprocesos(subprocesosResultado);

      if (sistemaId) {
        setSeleccionados(
          subprocesosResultado
            .filter(
              (item) =>
                item.sistema_id === sistemaId
            )
            .map((item) => item.id)
        );
      }
    } catch (error) {
      console.error(
        'Error cargando sistemas y subprocesos:',
        error
      );

      setSistemas([]);
      setSubprocesos([]);
    } finally {
      setLoading(false);
    }
  }, [sistemaId]);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const cambiarSistema = (id: string) => {
    const nuevoId = id
      ? Number(id)
      : null;

    setSistemaId(nuevoId);
    setMensaje('');
    setMostrarForm(false);

    if (!nuevoId) {
      setSeleccionados([]);
      return;
    }

    setSeleccionados(
      subprocesos
        .filter(
          (item) =>
            item.sistema_id === nuevoId
        )
        .map((item) => item.id)
    );
  };

  const cambiarSeleccion = (id: number) => {
    setSeleccionados((actuales) =>
      actuales.includes(id)
        ? actuales.filter(
            (item) => item !== id
          )
        : [...actuales, id]
    );
  };

  const guardarNuevo = async () => {
    if (!sistemaId) {
      setMensaje('Seleccione un sistema.');
      return;
    }

    if (!nombreNuevo.trim()) {
      setMensaje(
        'Ingrese el nombre del subproceso.'
      );
      return;
    }

    try {
      setMensaje('');

      await crearSubprocesoSistema({
        sistema_id: sistemaId,
        nombre: nombreNuevo.trim(),
        descripcion:
          descripcionNueva.trim() || undefined,
      });

      setNombreNuevo('');
      setDescripcionNueva('');
      setMostrarForm(false);

      await cargarDatos();

      setMensaje(
        'Subproceso creado correctamente.'
      );
    } catch (error) {
      console.error(
        'Error creando subproceso de sistema:',
        error
      );

      setMensaje(
        'No se pudo crear el subproceso.'
      );
    }
  };

  const guardarRelacion = async () => {
    if (!sistemaId) {
      setMensaje('Seleccione un sistema.');
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
      await relacionarSubprocesosConSistema(
        sistemaId,
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

  const sistemaSeleccionado =
    sistemas.find(
      (item) => item.id === sistemaId
    );

  const normalizar = (texto: string) =>
    texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

  const textoBusqueda =
    normalizar(busqueda.trim());

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
        <label>Sistema padre</label>

        <select
          value={sistemaId ?? ''}
          onChange={(e) =>
            cambiarSistema(e.target.value)
          }
        >
          <option value="">
            Seleccione un sistema
          </option>

          {sistemas.map((sistema) => (
            <option
              key={sistema.id}
              value={sistema.id}
            >
              {sistema.nombre}
            </option>
          ))}
        </select>
      </div>

      {sistemaSeleccionado && (
        <div className="planta-relation-panel">
          <div className="planta-relation-header">
            <div>
              <span className="planta-section-label">
                SISTEMA
              </span>

              <h3>
                {sistemaSeleccionado.nombre}
              </h3>

              <p>
                Seleccione los subprocesos que
                pertenecen a este sistema.
              </p>
            </div>

            <button
              type="button"
              className="planta-add-btn"
              onClick={() =>
                setMostrarForm(
                  (actual) => !actual
                )
              }
            >
              + Nuevo
            </button>
          </div>

          {mostrarForm && (
            <div className="planta-form">
              <label>
                Nombre del subproceso
              </label>

              <input
                type="text"
                value={nombreNuevo}
                onChange={(e) =>
                  setNombreNuevo(
                    e.target.value
                  )
                }
                placeholder="Nombre"
              />

              <label>
                Descripción
              </label>

              <input
                type="text"
                value={descripcionNueva}
                onChange={(e) =>
                  setDescripcionNueva(
                    e.target.value
                  )
                }
                placeholder="Descripción opcional"
              />

              <div className="planta-relation-actions">
                <button
                  type="button"
                  className="planta-save-btn"
                  onClick={guardarNuevo}
                >
                  Guardar subproceso
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMostrarForm(false);
                    setNombreNuevo('');
                    setDescripcionNueva('');
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="planta-relation-summary">
            <span>Subprocesos</span>

            <strong>
              {seleccionados.length}
            </strong>

            <span>seleccionados</span>
          </div>

          {!loading && (
            <>
              <div className="planta-relation-search">
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) =>
                    setBusqueda(
                      e.target.value
                    )
                  }
                  placeholder="Buscar subproceso..."
                />
              </div>

              {subprocesosFiltrados.length > 0 ? (
                <div className="planta-relation-grid">
                  {subprocesosFiltrados.map(
                    (subproceso) => {
                      const seleccionado =
                        seleccionados.includes(
                          subproceso.id
                        );

                      const relacionado =
                        subproceso.sistema_id ===
                        sistemaId;

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
              ) : (
                <div className="planta-empty">
                  No hay subprocesos de sistema
                  registrados.
                </div>
              )}

              {subprocesos.length > 0 && (
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
              )}
            </>
          )}

          {loading && (
            <div className="planta-empty">
              Cargando subprocesos...
            </div>
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