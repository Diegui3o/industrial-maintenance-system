import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  crearSubprocesoSistema,
  getSistemas,
  getTodosSubprocesosSistema,
  relacionarSubprocesosConSistema,
  type SistemaPlanta,
  type SubprocesoSistemaPlanta,
} from '../../services/plantaApi';

import { SubprocesosSistemaTransferencia } from './SubprocesosSistemaTransferencia';

interface Props {
  subprocesoInicialId?: number | null;
}

export function SubprocesosSistemaPanel({
  subprocesoInicialId = null,
}: Props) {
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

  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [nombreNuevo, setNombreNuevo] =
    useState('');

  const [descripcionNueva, setDescripcionNueva] =
    useState('');

  const cargarDatos = useCallback(
    async () => {
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
        setSubprocesos(
          subprocesosResultado
        );

        if (sistemaId) {
          setSeleccionados(
            subprocesosResultado
              .filter(
                (item) =>
                  item.sistema_id ===
                  sistemaId
              )
              .map(
                (item) => item.id
              )
          );
        }
      } catch (error) {
        console.error(
          'Error cargando sistemas:',
          error
        );
      } finally {
        setLoading(false);
      }
    },
    [sistemaId]
  );

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  useEffect(() => {
    if (!subprocesoInicialId) {
      return;
    }

    const subproceso =
      subprocesos.find(
        (item) =>
          item.id ===
          subprocesoInicialId
      );

    if (!subproceso) {
      return;
    }

    if (subproceso.sistema_id) {
      setSistemaId(
        subproceso.sistema_id
      );
    }

    setSeleccionados((actuales) =>
      actuales.includes(
        subproceso.id
      )
        ? actuales
        : [
            ...actuales,
            subproceso.id,
          ]
    );
  }, [
    subprocesoInicialId,
    subprocesos,
  ]);

  const cambiarSistema = (
    id: string
  ) => {
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
            item.sistema_id ===
            nuevoId
        )
        .map((item) => item.id)
    );
  };

  const guardarNuevo = async () => {
    if (!sistemaId) {
      setMensaje(
        'Seleccione un sistema.'
      );
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
        nombre:
          nombreNuevo.trim(),
        descripcion:
          descripcionNueva.trim() ||
          undefined,
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
        'Error creando subproceso:',
        error
      );

      setMensaje(
        'No se pudo crear el subproceso.'
      );
    }
  };

  const guardarRelacion = async () => {
    if (!sistemaId) {
      setMensaje(
        'Seleccione un sistema.'
      );
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
      (item) =>
        item.id === sistemaId
    );

  return (
    <div>
      <div className="planta-form">
        <label>
          Sistema padre
        </label>

        <select
          value={sistemaId ?? ''}
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
                Seleccione los subprocesos
                que pertenecen a este
                sistema.
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
              />

              <div className="planta-relation-actions">
                <button
                  type="button"
                  onClick={() =>
                    setMostrarForm(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="planta-save-btn"
                  onClick={() =>
                    void guardarNuevo()
                  }
                >
                  Guardar subproceso
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="planta-empty">
              Cargando subprocesos...
            </div>
          ) : (
            <>
              <div className="planta-relation-summary">
                <span>
                  Subprocesos asignados
                </span>

                <strong>
                  {seleccionados.length}
                </strong>
              </div>

              <SubprocesosSistemaTransferencia
                subprocesos={
                  subprocesos
                }
                seleccionados={
                  seleccionados
                }
                onSeleccionadosChange={
                  setSeleccionados
                }
              />

              <div className="planta-relation-actions">
                <button
                  type="button"
                  className="planta-save-btn"
                  onClick={() =>
                    void guardarRelacion()
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