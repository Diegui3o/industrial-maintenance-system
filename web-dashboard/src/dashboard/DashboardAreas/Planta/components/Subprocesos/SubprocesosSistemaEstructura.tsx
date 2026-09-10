import { useEffect, useState } from 'react';

import {
  getSubprocesosSistema,
  crearSubprocesoSistema,
  actualizarSubprocesoSistema,
} from '../../services/plantaApi';

interface SubprocesoSistema {
  id: number;
  sistema_id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

interface Props {
  sistemaId: string;
  onSelectSubproceso?: (
    subproceso: SubprocesoSistema
  ) => void;
}

export function SubprocesosSistemaEstructura({
  sistemaId,
  onSelectSubproceso,
}: Props) {
  const [
    subprocesos,
    setSubprocesos,
  ] = useState<SubprocesoSistema[]>([]);

  const [
    mostrarForm,
    setMostrarForm,
  ] = useState(false);

  const [
    editando,
    setEditando,
  ] = useState<SubprocesoSistema | null>(null);

  const [
    nombre,
    setNombre,
  ] = useState('');

  const [
    descripcion,
    setDescripcion,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    guardando,
    setGuardando,
  ] = useState(false);

  const cargar = async () => {
    if (!sistemaId) {
      setSubprocesos([]);
      return;
    }

    setLoading(true);

    try {
      const resultado =
        await getSubprocesosSistema(
          Number(sistemaId)
        );

      setSubprocesos(resultado);
    } catch (error) {
      console.error(
        'Error cargando subprocesos de sistema:',
        error
      );

      setSubprocesos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMostrarForm(false);
    setEditando(null);
    setNombre('');
    setDescripcion('');

    cargar();
  }, [sistemaId]);

  const nuevo = () => {
    setEditando(null);
    setNombre('');
    setDescripcion('');
    setMostrarForm(true);
  };

  const editar = (
    subproceso: SubprocesoSistema
  ) => {
    setEditando(subproceso);
    setNombre(subproceso.nombre);
    setDescripcion(
      subproceso.descripcion || ''
    );
    setMostrarForm(true);
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditando(null);
    setNombre('');
    setDescripcion('');
  };

  const guardar = async () => {
    if (
      !sistemaId ||
      !nombre.trim() ||
      guardando
    ) {
      return;
    }

    setGuardando(true);

    try {
      if (editando) {
        await actualizarSubprocesoSistema(
          editando.id,
          {
            sistema_id: Number(sistemaId),
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim() || undefined,
            activo: editando.activo,
          }
        );
      } else {
        await crearSubprocesoSistema({
          sistema_id: Number(sistemaId),
          nombre: nombre.trim(),
          descripcion:
            descripcion.trim() || undefined,
        });
      }

      cancelar();
      await cargar();
    } catch (error) {
      console.error(
        'Error guardando subproceso de sistema:',
        error
      );

      alert(
        'No se pudo guardar el subproceso.'
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <div className="planta-card-header">
        <div>
          <h3>Subprocesos de sistema</h3>

          <p>
            Subprocesos pertenecientes al sistema
            seleccionado.
          </p>
        </div>

        {!mostrarForm && (
          <button
            type="button"
            className="planta-add-btn"
            onClick={nuevo}
          >
            + Nuevo
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="planta-form">
          <input
            placeholder="Nombre del subproceso"
            value={nombre}
            onChange={(e) =>
              setNombre(e.target.value)
            }
            autoFocus
          />

          <input
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) =>
              setDescripcion(e.target.value)
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
                : editando
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
        !mostrarForm &&
        subprocesos.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No existen subprocesos
            </strong>

            <span>
              El sistema seleccionado todavía
              no tiene subprocesos.
            </span>
          </div>
        )}

      {!loading &&
        subprocesos.length > 0 && (
          <div className="planta-list">
            {subprocesos.map((subproceso) => (
              <div
                key={subproceso.id}
                className="planta-list-item"
              >
                <button
                  type="button"
                  className="planta-list-main"
                  onClick={() =>
                    onSelectSubproceso?.(
                      subproceso
                    )
                  }
                >
                  <div>
                    <strong>
                      {subproceso.nombre}
                    </strong>

                    {subproceso.descripcion && (
                      <small>
                        {subproceso.descripcion}
                      </small>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className="planta-edit-btn"
                  onClick={() =>
                    editar(subproceso)
                  }
                >
                  ✎
                </button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}