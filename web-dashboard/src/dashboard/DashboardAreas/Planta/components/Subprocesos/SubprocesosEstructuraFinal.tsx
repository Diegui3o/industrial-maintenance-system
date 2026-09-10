import { useEffect, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  getSubprocesos,
  getSubprocesosSistema,
  crearSubproceso,
  actualizarSubproceso,
  crearSubprocesoSistema,
  actualizarSubprocesoSistema,
  type Proceso,
  type SistemaPlanta,
  type Subproceso,
} from '../../services/plantaApi';

type TipoPadre =
  | 'proceso'
  | 'sistema'
  | '';

interface SubprocesoSistema {
  id: number;
  sistema_id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export function SubprocesosEstructuraFinal() {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [tipoPadre, setTipoPadre] =
    useState<TipoPadre>('');

  const [procesoId, setProcesoId] =
    useState('');

  const [sistemaId, setSistemaId] =
    useState('');

  const [
    subprocesosProceso,
    setSubprocesosProceso,
  ] = useState<Subproceso[]>([]);

  const [
    subprocesosSistema,
    setSubprocesosSistema,
  ] = useState<SubprocesoSistema[]>([]);

  const [
    subprocesoSeleccionadoId,
    setSubprocesoSeleccionadoId,
  ] = useState('');

  const [
    mostrarForm,
    setMostrarForm,
  ] = useState(false);

  const [
    editandoProceso,
    setEditandoProceso,
  ] = useState<Subproceso | null>(null);

  const [
    editandoSistema,
    setEditandoSistema,
  ] = useState<SubprocesoSistema | null>(
    null
  );

  const [nombre, setNombre] =
    useState('');

  const [descripcion, setDescripcion] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  /*
   * Cargar procesos y sistemas
   */
  useEffect(() => {
    let activo = true;

    const cargarPadres = async () => {
      try {
        const [
          procesosResultado,
          sistemasResultado,
        ] = await Promise.all([
          getProcesos(),
          getSistemas(),
        ]);

        if (!activo) {
          return;
        }

        setProcesos(procesosResultado);
        setSistemas(sistemasResultado);
      } catch (error) {
        if (!activo) {
          return;
        }

        console.error(
          'Error cargando procesos y sistemas:',
          error
        );

        setProcesos([]);
        setSistemas([]);
      }
    };

    cargarPadres();

    return () => {
      activo = false;
    };
  }, []);

  /*
   * Cargar subprocesos de PROCESO
   */
  useEffect(() => {
    if (
      tipoPadre !== 'proceso' ||
      !procesoId
    ) {
      return;
    }

    let activo = true;

    const cargar = async () => {
      setLoading(true);

      try {
        const resultado =
          await getSubprocesos(
            Number(procesoId)
          );

        if (!activo) {
          return;
        }

        setSubprocesosProceso(
          resultado
        );
      } catch (error) {
        if (!activo) {
          return;
        }

        console.error(
          'Error cargando subprocesos de proceso:',
          error
        );

        setSubprocesosProceso([]);
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
  }, [tipoPadre, procesoId]);

  /*
   * Cargar subprocesos de SISTEMA
   */
  useEffect(() => {
    if (
      tipoPadre !== 'sistema' ||
      !sistemaId
    ) {
      return;
    }

    let activo = true;

    const cargar = async () => {
      setLoading(true);

      try {
        const resultado =
          await getSubprocesosSistema(
            Number(sistemaId)
          );

        if (!activo) {
          return;
        }

        setSubprocesosSistema(
          resultado
        );
      } catch (error) {
        if (!activo) {
          return;
        }

        console.error(
          'Error cargando subprocesos de sistema:',
          error
        );

        setSubprocesosSistema([]);
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
  }, [tipoPadre, sistemaId]);

  const cambiarTipoPadre = (
    tipo: TipoPadre
  ) => {
    setTipoPadre(tipo);
    setProcesoId('');
    setSistemaId('');
    setSubprocesosProceso([]);
    setSubprocesosSistema([]);
    setSubprocesoSeleccionadoId('');
    setMostrarForm(false);
    setEditandoProceso(null);
    setEditandoSistema(null);
    setNombre('');
    setDescripcion('');
  };

  const cambiarProceso = (
    id: string
  ) => {
    setProcesoId(id);
    setSistemaId('');
    setSubprocesosSistema([]);
    setSubprocesoSeleccionadoId('');
    setMostrarForm(false);
    setEditandoProceso(null);
    setEditandoSistema(null);
    setNombre('');
    setDescripcion('');
  };

  const cambiarSistema = (
    id: string
  ) => {
    setSistemaId(id);
    setProcesoId('');
    setSubprocesosProceso([]);
    setSubprocesoSeleccionadoId('');
    setMostrarForm(false);
    setEditandoProceso(null);
    setEditandoSistema(null);
    setNombre('');
    setDescripcion('');
  };

  const nuevo = () => {
    if (
      tipoPadre === 'proceso' &&
      !procesoId
    ) {
      return;
    }

    if (
      tipoPadre === 'sistema' &&
      !sistemaId
    ) {
      return;
    }

    setEditandoProceso(null);
    setEditandoSistema(null);
    setNombre('');
    setDescripcion('');
    setMostrarForm(true);
  };

  const editarProceso = (
    subproceso: Subproceso
  ) => {
    setEditandoProceso(subproceso);
    setEditandoSistema(null);
    setNombre(subproceso.nombre);
    setDescripcion(
      subproceso.descripcion || ''
    );
    setMostrarForm(true);
  };

  const editarSistema = (
    subproceso: SubprocesoSistema
  ) => {
    setEditandoSistema(subproceso);
    setEditandoProceso(null);
    setNombre(subproceso.nombre);
    setDescripcion(
      subproceso.descripcion || ''
    );
    setMostrarForm(true);
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditandoProceso(null);
    setEditandoSistema(null);
    setNombre('');
    setDescripcion('');
  };

  const guardar = async () => {
    if (
      !nombre.trim() ||
      guardando
    ) {
      return;
    }

    setGuardando(true);

    try {
      if (tipoPadre === 'proceso') {
        if (!procesoId) {
          return;
        }

        if (editandoProceso) {
          await actualizarSubproceso(
            editandoProceso.id,
            {
              proceso_id:
                Number(procesoId),
              nombre: nombre.trim(),
              descripcion:
                descripcion.trim() ||
                undefined,
              activo:
                editandoProceso.activo,
            }
          );
        } else {
          await crearSubproceso({
            proceso_id:
              Number(procesoId),
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim() ||
              undefined,
          });
        }

        const resultado =
          await getSubprocesos(
            Number(procesoId)
          );

        setSubprocesosProceso(
          resultado
        );
      }

      if (tipoPadre === 'sistema') {
        if (!sistemaId) {
          return;
        }

        if (editandoSistema) {
          await actualizarSubprocesoSistema(
            editandoSistema.id,
            {
              sistema_id:
                Number(sistemaId),
              nombre: nombre.trim(),
              descripcion:
                descripcion.trim() ||
                undefined,
              activo:
                editandoSistema.activo,
            }
          );
        } else {
          await crearSubprocesoSistema({
            sistema_id:
              Number(sistemaId),
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim() ||
              undefined,
          });
        }

        const resultado =
          await getSubprocesosSistema(
            Number(sistemaId)
          );

        setSubprocesosSistema(
          resultado
        );
      }

      cancelar();
    } catch (error) {
      console.error(
        'Error guardando subproceso:',
        error
      );

      alert(
        'No se pudo guardar el subproceso.'
      );
    } finally {
      setGuardando(false);
    }
  };

  const procesoSeleccionado =
    procesos.find(
      (item) =>
        item.id.toString() ===
        procesoId
    );

  const sistemaSeleccionado =
    sistemas.find(
      (item) =>
        item.id.toString() ===
        sistemaId
    );

  const subprocesoProcesoSeleccionado =
    subprocesosProceso.find(
      (item) =>
        item.id.toString() ===
        subprocesoSeleccionadoId
    );

  const subprocesoSistemaSeleccionado =
    subprocesosSistema.find(
      (item) =>
        item.id.toString() ===
        subprocesoSeleccionadoId
    );

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Subprocesos</h3>

          <p>
            Seleccione el proceso o sistema
            padre para administrar sus
            subprocesos.
          </p>
        </div>
      </div>

      {/* TIPO DE ESTRUCTURA */}

      <div className="planta-form">
        <label>
          Tipo de estructura
        </label>

        <select
          value={tipoPadre}
          onChange={(e) =>
            cambiarTipoPadre(
              e.target.value as TipoPadre
            )
          }
        >
          <option value="">
            Seleccione una opción
          </option>

          <option value="proceso">
            Proceso
          </option>

          <option value="sistema">
            Sistema
          </option>
        </select>
      </div>

      {/* ================================================= */}
      {/* PROCESO */}
      {/* ================================================= */}

      {tipoPadre === 'proceso' && (
        <>
          <div className="planta-form">
            <label>
              Proceso padre
            </label>

            <select
              value={procesoId}
              onChange={(e) =>
                cambiarProceso(
                  e.target.value
                )
              }
            >
              <option value="">
                Seleccione un proceso
              </option>

              {procesos.map(
                (proceso) => (
                  <option
                    key={proceso.id}
                    value={proceso.id}
                  >
                    {proceso.nombre}
                  </option>
                )
              )}
            </select>
          </div>

          {procesoSeleccionado &&
            !mostrarForm && (
              <div className="planta-card-header">
                <div>
                  <strong>
                    {procesoSeleccionado.nombre}
                  </strong>

                  <p>
                    {subprocesosProceso.length}{' '}
                    subproceso(s)
                  </p>
                </div>

                <button
                  type="button"
                  className="planta-add-btn"
                  onClick={nuevo}
                >
                  + Nuevo
                </button>
              </div>
            )}

          {mostrarForm && (
            <div className="planta-form">
              <h4>
                {editandoProceso
                  ? 'Editar subproceso'
                  : 'Nuevo subproceso'}
              </h4>

              <input
                placeholder="Nombre del subproceso"
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                autoFocus
              />

              <input
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
              />

              <div className="planta-form-actions">
                <button
                  type="button"
                  className="planta-cancel-btn"
                  onClick={cancelar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="planta-save-btn"
                  onClick={guardar}
                  disabled={
                    !nombre.trim() ||
                    guardando
                  }
                >
                  {guardando
                    ? 'Guardando...'
                    : editandoProceso
                      ? 'Actualizar'
                      : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="planta-empty">
              Cargando subprocesos...
            </div>
          )}

          {!loading &&
            procesoId &&
            subprocesosProceso.length === 0 &&
            !mostrarForm && (
              <div className="planta-alert warning">
                <strong>
                  No existen subprocesos
                </strong>

                <span>
                  El proceso seleccionado todavía
                  no tiene subprocesos. Puede
                  crear uno con el botón + Nuevo.
                </span>
              </div>
            )}

          {/* SELECTOR DE SUBPROCESO */}

          {!loading &&
            subprocesosProceso.length > 0 && (
              <>
                <div className="planta-form">
                  <label>
                    Subproceso
                  </label>

                  <select
                    value={
                      subprocesoSeleccionadoId
                    }
                    onChange={(e) =>
                      setSubprocesoSeleccionadoId(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Seleccione un subproceso
                    </option>

                    {subprocesosProceso.map(
                      (subproceso) => (
                        <option
                          key={subproceso.id}
                          value={subproceso.id}
                        >
                          {subproceso.nombre}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {subprocesoProcesoSeleccionado && (
                  <div className="planta-alert">
                    <strong>
                      Subproceso seleccionado:
                    </strong>

                    <span>
                      {
                        subprocesoProcesoSeleccionado.nombre
                      }
                    </span>
                  </div>
                )}

                <div className="planta-list">
                  {subprocesosProceso.map(
                    (subproceso) => (
                      <div
                        key={subproceso.id}
                        className="planta-list-item"
                      >
                        <div className="planta-list-main">
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
                          </div>
                        </div>

                        <button
                          type="button"
                          className="planta-edit-btn"
                          onClick={() =>
                            editarProceso(
                              subproceso
                            )
                          }
                        >
                          Editar
                        </button>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
        </>
      )}

      {/* ================================================= */}
      {/* SISTEMA */}
      {/* ================================================= */}

      {tipoPadre === 'sistema' && (
        <>
          <div className="planta-form">
            <label>
              Sistema padre
            </label>

            <select
              value={sistemaId}
              onChange={(e) =>
                cambiarSistema(
                  e.target.value
                )
              }
            >
              <option value="">
                Seleccione un sistema
              </option>

              {sistemas.map(
                (sistema) => (
                  <option
                    key={sistema.id}
                    value={sistema.id}
                  >
                    {sistema.nombre}
                  </option>
                )
              )}
            </select>
          </div>

          {sistemaSeleccionado &&
            !mostrarForm && (
              <div className="planta-card-header">
                <div>
                  <strong>
                    {sistemaSeleccionado.nombre}
                  </strong>

                  <p>
                    {subprocesosSistema.length}{' '}
                    subproceso(s)
                  </p>
                </div>

                <button
                  type="button"
                  className="planta-add-btn"
                  onClick={nuevo}
                >
                  + Nuevo
                </button>
              </div>
            )}

          {mostrarForm && (
            <div className="planta-form">
              <h4>
                {editandoSistema
                  ? 'Editar subproceso'
                  : 'Nuevo subproceso'}
              </h4>

              <input
                placeholder="Nombre del subproceso"
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                autoFocus
              />

              <input
                placeholder="Descripción"
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
              />

              <div className="planta-form-actions">
                <button
                  type="button"
                  className="planta-cancel-btn"
                  onClick={cancelar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="planta-save-btn"
                  onClick={guardar}
                  disabled={
                    !nombre.trim() ||
                    guardando
                  }
                >
                  {guardando
                    ? 'Guardando...'
                    : editandoSistema
                      ? 'Actualizar'
                      : 'Guardar'}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="planta-empty">
              Cargando subprocesos...
            </div>
          )}

          {!loading &&
            sistemaId &&
            subprocesosSistema.length === 0 &&
            !mostrarForm && (
              <div className="planta-alert warning">
                <strong>
                  No existen subprocesos
                </strong>

                <span>
                  El sistema seleccionado todavía
                  no tiene subprocesos. Puede
                  crear uno con el botón + Nuevo.
                </span>
              </div>
            )}

          {/* SELECTOR DE SUBPROCESO */}

          {!loading &&
            subprocesosSistema.length > 0 && (
              <>
                <div className="planta-form">
                  <label>
                    Subproceso
                  </label>

                  <select
                    value={
                      subprocesoSeleccionadoId
                    }
                    onChange={(e) =>
                      setSubprocesoSeleccionadoId(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Seleccione un subproceso
                    </option>

                    {subprocesosSistema.map(
                      (subproceso) => (
                        <option
                          key={subproceso.id}
                          value={subproceso.id}
                        >
                          {subproceso.nombre}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {subprocesoSistemaSeleccionado && (
                  <div className="planta-alert">
                    <strong>
                      Subproceso seleccionado:
                    </strong>

                    <span>
                      {
                        subprocesoSistemaSeleccionado.nombre
                      }
                    </span>
                  </div>
                )}

                <div className="planta-list">
                  {subprocesosSistema.map(
                    (subproceso) => (
                      <div
                        key={subproceso.id}
                        className="planta-list-item"
                      >
                        <div className="planta-list-main">
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
                          </div>
                        </div>

                        <button
                          type="button"
                          className="planta-edit-btn"
                          onClick={() =>
                            editarSistema(
                              subproceso
                            )
                          }
                        >
                          Editar
                        </button>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
        </>
      )}

    </section>
  );
}