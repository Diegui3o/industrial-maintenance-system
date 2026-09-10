import { useState } from 'react';
import { ProcesoForm } from './ProcesoForm';
import type { Proceso } from '../../services/plantaApi';

interface Props {
  procesos: Proceso[];
  loading: boolean;
  onReload: () => void;
}

export function ProcesoList({
  procesos,
  loading,
  onReload,
}: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editar, setEditar] = useState<Proceso | null>(null);

  const cerrarForm = () => {
    setMostrarForm(false);
    setEditar(null);
  };

  const guardado = async () => {
    cerrarForm();
    onReload();
  };

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Procesos</h3>
          <p>
            Procesos principales de la planta.
          </p>
        </div>

        {!mostrarForm && !editar && (
          <button
            type="button"
            className="planta-add-btn"
            onClick={() => setMostrarForm(true)}
          >
            + Nuevo
          </button>
        )}
      </div>

      {(mostrarForm || editar) && (
        <ProcesoForm
          proceso={editar}
          onSaved={guardado}
          onCancel={cerrarForm}
        />
      )}

      {loading ? (
        <div className="planta-empty">
          Cargando procesos...
        </div>
      ) : procesos.length === 0 ? (
        <div className="planta-empty">
          No hay procesos registrados.
        </div>
      ) : (
        <div className="planta-list">
          {procesos.map((proceso) => (
            <div
              key={proceso.id}
              className="planta-list-item"
            >
              <div className="planta-list-main">
                <div>
                  <strong>{proceso.nombre}</strong>

                  {proceso.descripcion && (
                    <small>
                      {proceso.descripcion}
                    </small>
                  )}
                </div>

                <span>
                  {proceso.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </div>

              <button
                type="button"
                className="planta-edit-btn"
                onClick={() => {
                  setEditar(proceso);
                  setMostrarForm(false);
                }}
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