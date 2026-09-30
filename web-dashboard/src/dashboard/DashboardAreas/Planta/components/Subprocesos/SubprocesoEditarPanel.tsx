import { useEffect, useState } from 'react';

import {
  actualizarSubproceso,
  getTodosSubprocesos,
  type Subproceso,
} from '../../services/plantaApi';

interface Props {
  refrescar?: number;
}

export function SubprocesoEditarPanel({
  refrescar = 0,
}: Props) {
  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([]);

  const [subprocesoId, setSubprocesoId] =
    useState<number | null>(null);

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] =
    useState('');

  const [cargando, setCargando] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  const cargar = async () => {
    setCargando(true);
    setMensaje('');

    try {
      const resultado =
        await getTodosSubprocesos();

      setSubprocesos(resultado);

      if (
        subprocesoId &&
        resultado.some(
          (item) => item.id === subprocesoId
        )
      ) {
        return;
      }

      setSubprocesoId(null);
      setNombre('');
      setDescripcion('');
    } catch (error) {
      console.error(
        'Error cargando subprocesos:',
        error
      );

      setMensaje(
        'No se pudieron cargar los subprocesos.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, [refrescar]);

  const seleccionar = (id: string) => {
    if (!id) {
      setSubprocesoId(null);
      setNombre('');
      setDescripcion('');
      setMensaje('');
      return;
    }

    const seleccionado =
      subprocesos.find(
        (item) => item.id === Number(id)
      );

    if (!seleccionado) {
      return;
    }

    setSubprocesoId(seleccionado.id);
    setNombre(seleccionado.nombre);
    setDescripcion(
      seleccionado.descripcion ?? ''
    );
    setMensaje('');
  };

  const guardar = async () => {
    if (
      !subprocesoId ||
      !nombre.trim() ||
      guardando
    ) {
      return;
    }

    const subproceso =
      subprocesos.find(
        (item) => item.id === subprocesoId
      );

    if (!subproceso) {
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await actualizarSubproceso(
        subproceso.id,
        {
          proceso_id:
            subproceso.proceso_id ?? 0,
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() ||
            undefined,
          activo: subproceso.activo,
        }
      );

      setMensaje(
        'Subproceso actualizado correctamente.'
      );

      await cargar();
    } catch (error) {
      console.error(
        'Error actualizando subproceso:',
        error
      );

      setMensaje(
        'No se pudo actualizar el subproceso.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="planta-subproceso-editor">
      <div className="planta-subproceso-editor-header">
        <div>
          <span className="planta-section-label">
            EDITAR
          </span>

          <h3>
            Subprocesos
          </h3>

          <p>
            Seleccione un subproceso para
            modificar sus datos.
          </p>
        </div>
      </div>

      <div className="planta-subproceso-editor-body">
        <div className="planta-subproceso-editor-field">
          <label>
            Subproceso
          </label>

          <select
            value={subprocesoId ?? ''}
            onChange={(e) =>
              seleccionar(e.target.value)
            }
            disabled={
              cargando ||
              guardando
            }
          >
            <option value="">
              Seleccione un subproceso
            </option>

            {subprocesos
              .filter((item) => item.activo)
              .sort((a, b) =>
                a.nombre.localeCompare(
                  b.nombre,
                  'es',
                  {
                    sensitivity: 'base',
                  }
                )
              )
              .map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.nombre}
                </option>
              ))}
          </select>
        </div>

        {subprocesoId && (
          <>
            <div className="planta-subproceso-editor-field">
              <label>
                Nombre
              </label>

              <input
                value={nombre}
                onChange={(e) =>
                  setNombre(
                    e.target.value
                  )
                }
                disabled={guardando}
              />
            </div>

            <div className="planta-subproceso-editor-field">
              <label>
                Descripción
              </label>

              <input
                value={descripcion}
                onChange={(e) =>
                  setDescripcion(
                    e.target.value
                  )
                }
                disabled={guardando}
              />
            </div>

            <button
              type="button"
              className="planta-subproceso-editor-save"
              onClick={guardar}
              disabled={
                !nombre.trim() ||
                guardando
              }
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>
          </>
        )}
      </div>

      {mensaje && (
        <div className="planta-subproceso-editor-message">
          {mensaje}
        </div>
      )}
    </section>
  );
}