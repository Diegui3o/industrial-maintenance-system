import { useEffect, useState } from 'react';

import {
  getTodosComponentes,
  type Componente,
} from '../../services/plantaApi';

import { SubcomponentesEstructuraCompleta } from './SubcomponentesEstructuraCompleta';

export function ComponentesEstructuraCompleta() {
  const [componentes, setComponentes] =
    useState<Componente[]>([]);
  const [componenteId, setComponenteId] =
    useState('');
  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);

      try {
        const resultado =
          await getTodosComponentes();

        if (!activo) {
          return;
        }

        setComponentes(resultado);
      } catch (error) {
        if (!activo) {
          return;
        }

        console.error(
          'Error cargando componentes:',
          error
        );

        setComponentes([]);
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    void cargar();

    return () => {
      activo = false;
    };
  }, []);

  const componenteSeleccionado =
    componentes.find(
      (item) =>
        item.id.toString() === componenteId
    ) || null;

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Componentes</h3>

          <p>
            Componentes registrados en la planta.
          </p>
        </div>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando componentes...
        </div>
      )}

      {!loading &&
        componentes.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No existen componentes
            </strong>

            <span>
              Registre un componente para
              comenzar la estructura.
            </span>
          </div>
        )}

      {!loading &&
        componentes.length > 0 && (
          <>
            <div className="planta-form">
              <label>
                Componente
              </label>

              <select
                value={componenteId}
                onChange={(e) =>
                  setComponenteId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccione un componente
                </option>

                {componentes.map(
                  (componente) => (
                    <option
                      key={componente.id}
                      value={componente.id}
                    >
                      {componente.codigo
                        ? `${componente.codigo} — ${componente.nombre}`
                        : componente.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            {componenteSeleccionado && (
              <SubcomponentesEstructuraCompleta
                componente={
                  componenteSeleccionado
                }
              />
            )}
          </>
        )}

      {!loading && (
        <div className="planta-relation-actions">
          <button
            type="button"
            className="planta-save-btn"
          >
            + Crear componente
          </button>
        </div>
      )}
    </section>
  );
}