import { useEffect, useState } from 'react';
import {
  getSubprocesos,
  type Proceso,
  type Subproceso,
} from '../services/plantaApi';
import { SubprocesoForm } from './SubprocesoForm';

interface Props {
  proceso: Proceso | null;
  seleccionado: Subproceso | null;
  onSelect: (subproceso: Subproceso) => void;
}

export function SubprocesoList({
  proceso,
  seleccionado,
  onSelect,
}: Props) {
  const [items, setItems] = useState<Subproceso[]>([]);
  const [loading, setLoading] = useState(false);
  const [nuevo, setNuevo] = useState(false);
  const [editar, setEditar] =
    useState<Subproceso | null>(null);

  const cargar = async () => {
    if (!proceso) return;

    setLoading(true);

    try {
      setItems(await getSubprocesos(proceso.id));
    } catch (error) {
      console.error('Error cargando subprocesos:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setNuevo(false);
    setEditar(null);

    if (proceso) {
      cargar();
    }
  }, [proceso]);

  const cerrarForm = () => {
    setNuevo(false);
    setEditar(null);
  };

  const guardado = async () => {
    cerrarForm();
    await cargar();
  };

  if (!proceso) {
    return (
      <section className="planta-card planta-empty-panel">
        <h3>Subprocesos</h3>
        <p>Selecciona un proceso.</p>
      </section>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>{proceso.nombre}</h3>
          <p>Subprocesos</p>
        </div>

        {!nuevo && !editar && (
          <button
            className="planta-add-btn"
            onClick={() => setNuevo(true)}
          >
            + Nuevo
          </button>
        )}
      </div>

      {(nuevo || editar) && (
        <SubprocesoForm
          procesoId={proceso.id}
          subproceso={editar}
          onSaved={guardado}
          onCancel={cerrarForm}
        />
      )}

      <div className="planta-list">
        {loading && (
          <div className="planta-empty">
            Cargando subprocesos...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="planta-empty">
            No hay subprocesos registrados.
          </div>
        )}

        {!loading &&
          items.map((item) => (
            <div
              key={item.id}
              className={`planta-list-item ${
                seleccionado?.id === item.id
                  ? 'selected'
                  : ''
              }`}
            >
              <button
                className="planta-list-select"
                onClick={() => onSelect(item)}
              >
                <div>
                  <strong>{item.nombre}</strong>

                  {item.descripcion && (
                    <small>{item.descripcion}</small>
                  )}
                </div>

                <span>
                  {item.activo ? 'Activo' : 'Inactivo'}
                </span>
              </button>

              <button
                className="planta-edit-btn"
                onClick={() => setEditar(item)}
                title="Editar subproceso"
              >
                ✎
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}