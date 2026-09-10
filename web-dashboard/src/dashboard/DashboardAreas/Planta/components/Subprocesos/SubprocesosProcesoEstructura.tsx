import { useEffect, useState } from 'react';

import {
  getSubprocesos,
  type Proceso,
  type Subproceso,
} from '../../services/plantaApi';

import { SubprocesoForm } from './SubprocesoForm';

interface Props {
  procesos: Proceso[];
  procesoId: string;
  onSelectSubproceso?: (
    subproceso: Subproceso
  ) => void;
}

export function SubprocesosProcesoEstructura({
  procesos,
  procesoId,
  onSelectSubproceso,
}: Props) {
  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([]);

  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [editando, setEditando] =
    useState<Subproceso | null>(null);

  const [loading, setLoading] =
    useState(false);

  const cargar = async () => {
    if (!procesoId) {
      setSubprocesos([]);
      return;
    }

    setLoading(true);

    try {
      const resultado = await getSubprocesos(
        Number(procesoId)
      );

      setSubprocesos(resultado);
    } catch (error) {
      console.error(
        'Error cargando subprocesos de proceso:',
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
    cargar();
  }, [procesoId]);

  const procesoSeleccionado =
    procesos.find(
      (proceso) =>
        proceso.id.toString() === procesoId
    ) || null;

  const nuevo = () => {
    if (!procesoId) return;

    setEditando(null);
    setMostrarForm(true);
  };

  const editar = (
    subproceso: Subproceso
  ) => {
    setEditando(subproceso);
    setMostrarForm(true);
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditando(null);
  };

  const guardado = async () => {
    setMostrarForm(false);
    setEditando(null);
    await cargar();
  };

  return (
    <div>
      <div className="planta-card-header">
        <div>
          <h3>Subprocesos de proceso</h3>

          <p>
            Subprocesos pertenecientes al proceso
            seleccionado.
          </p>
        </div>

        {!mostrarForm && !editando && (
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
        <SubprocesoForm
          proceso={procesoSeleccionado}
          subproceso={editando}
          onSaved={guardado}
          onCancel={cancelar}
        />
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
              El proceso seleccionado todavía
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