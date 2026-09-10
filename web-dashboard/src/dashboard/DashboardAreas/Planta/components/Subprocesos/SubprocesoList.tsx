import { useEffect, useState } from 'react';

import {
  getSubprocesos,
  type Proceso,
  type Subproceso,
} from '../../services/plantaApi';

import { SubprocesoForm } from './SubprocesoForm';

interface Props {
  procesos: Proceso[];
  onSelect: (subproceso: Subproceso) => void;
}

export function SubprocesoList({
  procesos,
  onSelect,
}: Props) {
  const [procesoId, setProcesoId] =
    useState('');

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
        'Error cargando subprocesos:',
        error
      );

      setSubprocesos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSubprocesos([]);
    setMostrarForm(false);
    setEditando(null);

    if (procesoId) {
      cargar();
    }
  }, [procesoId]);

  const nuevo = () => {
    if (!procesoId) {
      return;
    }

    setEditando(null);
    setMostrarForm(true);
  };

  const editar = (
    subproceso: Subproceso
  ) => {
    setEditando(subproceso);
    setMostrarForm(true);
  };

  const guardado = async () => {
    setMostrarForm(false);
    setEditando(null);
    await cargar();
  };

  const cancelar = () => {
    setMostrarForm(false);
    setEditando(null);
  };

  const procesoSeleccionado =
    procesos.find(
      (item) =>
        item.id.toString() === procesoId
    ) || null;

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Subprocesos</h3>

          <p>
            Seleccione el proceso al que
            pertenece el subproceso.
          </p>
        </div>

        {procesoId &&
          !mostrarForm &&
          !editando && (
            <button
              type="button"
              className="planta-add-btn"
              onClick={nuevo}
            >
              + Nuevo
            </button>
          )}
      </div>

      <div className="planta-form">
        <select
          value={procesoId}
          onChange={(e) =>
            setProcesoId(e.target.value)
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

      {mostrarForm && (
        <SubprocesoForm
          proceso={procesoSeleccionado}
          subproceso={editando}
          onSaved={guardado}
          onCancel={cancelar}
        />
      )}

      {!procesoId && (
        <div className="planta-alert warning">
          <strong>
            Seleccione un proceso
          </strong>

          <span>
            Debe elegir un proceso padre
            para visualizar o crear sus
            subprocesos.
          </span>
        </div>
      )}

      {procesoId && loading && (
        <div className="planta-empty">
          Cargando subprocesos...
        </div>
      )}

      {procesoId &&
        !loading &&
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

      {procesoId &&
        !loading &&
        subprocesos.length > 0 && (
          <div className="planta-list">
            {subprocesos.map((item) => (
              <div
                key={item.id}
                className="planta-list-item"
              >
                <button
                  type="button"
                  className="planta-list-main"
                  onClick={() =>
                    onSelect(item)
                  }
                >
                  <div>
                    <strong>
                      {item.nombre}
                    </strong>

                    {item.descripcion && (
                      <small>
                        {item.descripcion}
                      </small>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className="planta-edit-btn"
                  onClick={() =>
                    editar(item)
                  }
                >
                  ✎
                </button>
              </div>
            ))}
          </div>
        )}

    </section>
  );
}