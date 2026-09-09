import { useEffect, useState } from 'react';
import {
  getSubprocesos,
  type Proceso,
  type Subproceso,
} from '../services/plantaApi';
import { SubprocesoForm } from './SubprocesoForm';

interface Props {
  proceso: Proceso | null;
  onSelect: (subproceso: Subproceso) => void;
}

export function SubprocesoList({
  proceso,
  onSelect,
}: Props) {
  const [subprocesos, setSubprocesos] = useState<
    Subproceso[]
  >([]);

  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [editando, setEditando] =
    useState<Subproceso | null>(null);

  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    if (!proceso) return;

    setLoading(true);

    try {
      const resultado = await getSubprocesos(
        proceso.id
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

    if (proceso) {
      cargar();
    }
  }, [proceso?.id]);

  const nuevo = () => {
    if (!proceso) return;

    setEditando(null);
    setMostrarForm(true);
  };

  const editar = (
    subproceso: Subproceso
  ) => {
    setEditando(subproceso);
    setMostrarForm(true);
  };

  if (!proceso) {
    return (
      <section className="planta-card">
        <div className="planta-alert warning">
          <strong>
            Seleccione un proceso
          </strong>

          <span>
            Primero debe seleccionar un proceso
            para administrar sus subprocesos.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Subprocesos</h3>

          <p>
            Proceso: <strong>{proceso.nombre}</strong>
          </p>
        </div>

        {!mostrarForm && (
          <button
            className="planta-add-btn"
            onClick={nuevo}
          >
            + Crear subproceso
          </button>
        )}
      </div>

      {mostrarForm && (
        <SubprocesoForm
          proceso={proceso}
          subproceso={editando}
          onSaved={async () => {
            setMostrarForm(false);
            setEditando(null);
            await cargar();
          }}
          onCancel={() => {
            setMostrarForm(false);
            setEditando(null);
          }}
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
              Este proceso no tiene subprocesos
            </strong>

            <span>
              Cree el primer subproceso para
              continuar con la estructura.
            </span>
          </div>
        )}

      {!loading &&
        subprocesos.length > 0 && (
          <div className="planta-list">
            {subprocesos.map((item) => (
              <div
                key={item.id}
                className="planta-list-item"
              >
                <button
                  className="planta-list-main"
                  onClick={() =>
                    onSelect(item)
                  }
                >
                  <strong>
                    {item.nombre}
                  </strong>

                  {item.descripcion && (
                    <small>
                      {item.descripcion}
                    </small>
                  )}
                </button>

                <button
                  className="planta-edit-btn"
                  onClick={() =>
                    editar(item)
                  }
                >
                  Editar
                </button>
              </div>
            ))}
          </div>
        )}
    </section>
  );
}