import { useState } from 'react';
import {
  type SistemaPlanta,
} from '../../services/plantaApi';
import { SistemaForm } from './SistemaForm';

interface Props {
  sistemas: SistemaPlanta[];
  onReload: () => void;
}

export function SistemaList({
  sistemas,
  onReload,
}: Props) {
  const [mostrarForm, setMostrarForm] =
    useState(false);

  const [editar, setEditar] =
    useState<SistemaPlanta | null>(null);

  const cerrarForm = () => {
    setMostrarForm(false);
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
          <h3>Sistemas</h3>

          <p>
            Sistemas independientes de la planta.
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
        <SistemaForm
          sistema={editar}
          onSaved={guardado}
          onCancel={cerrarForm}
        />
      )}

      {sistemas.length === 0 ? (
        <div className="planta-empty">
          No hay sistemas registrados.
        </div>
      ) : (
        <div className="planta-list">
          {sistemas.map((sistema) => (
            <div
              key={sistema.id}
              className="planta-list-item"
            >
              <div className="planta-list-main">
                <div>
                  <strong>
                    {sistema.nombre}
                  </strong>

                  {sistema.descripcion && (
                    <small>
                      {sistema.descripcion}
                    </small>
                  )}
                </div>

                <span>
                  {sistema.activo
                    ? 'Activo'
                    : 'Inactivo'}
                </span>
              </div>

              <button
                type="button"
                className="planta-edit-btn"
                onClick={() => {
                  setEditar(sistema);
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