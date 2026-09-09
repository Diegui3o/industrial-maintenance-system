import { useState } from 'react';
import { ProcesoForm } from './ProcesoForm';
import type { Proceso } from '../services/plantaApi';

interface Props {
  procesos: Proceso[];
  seleccionado: Proceso | null;
  loading: boolean;
  onSelect: (proceso: Proceso) => void;
  onReload: () => void;
}

export function ProcesoList({
  procesos,
  seleccionado,
  loading,
  onSelect,
  onReload,
}: Props) {
  const [editar, setEditar] = useState<Proceso | null>(null);
  const [nuevo, setNuevo] = useState(false);

  const cerrarForm = () => {
    setNuevo(false);
    setEditar(null);
  };

  const guardado = () => {
    cerrarForm();
    onReload();
  };

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Procesos</h3>
          <span>{procesos.length}</span>
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
        <ProcesoForm
          proceso={editar}
          onSaved={guardado}
          onCancel={cerrarForm}
        />
      )}

      <div className="planta-list">
        {loading && (
          <div className="planta-empty">
            Cargando procesos...
          </div>
        )}

        {!loading && procesos.length === 0 && (
          <div className="planta-empty">
            No hay procesos registrados.
          </div>
        )}

        {!loading &&
          procesos.map((item) => (
            <div
              key={item.id}
              className={`planta-list-item ${
                seleccionado?.id === item.id ? 'selected' : ''
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
                title="Editar proceso"
              >
                ✎
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}