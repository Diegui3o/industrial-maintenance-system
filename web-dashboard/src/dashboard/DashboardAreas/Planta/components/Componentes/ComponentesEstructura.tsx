import { useEffect, useState } from 'react';

import {
  getComponentes,
  type Componente,
  type Equipo,
} from '../../services/plantaApi';

import { SubcomponentesEstructura } from './SubcomponentesEstructura';

interface Props {
  equipo: Equipo | null;
}

export function ComponentesEstructura({
  equipo,
}: Props) {
  const [
    componentes,
    setComponentes,
  ] = useState<Componente[]>([]);

  const [
    componenteSeleccionado,
    setComponenteSeleccionado,
  ] = useState<Componente | null>(null);

  const [loading, setLoading] =
    useState(false);

  const cargar = async () => {
    if (!equipo) {
      setComponentes([]);
      setComponenteSeleccionado(null);
      return;
    }

    setLoading(true);

    try {
      const resultado =
        await getComponentes(equipo.id);

      setComponentes(resultado);
    } catch (error) {
      console.error(
        'Error cargando componentes:',
        error
      );

      setComponentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setComponenteSeleccionado(null);
    cargar();
  }, [equipo?.id]);

  if (!equipo) {
    return (
      <section className="planta-card">
        <div className="planta-card-header">
          <div>
            <h3>Componentes</h3>

            <p>
              Seleccione primero un equipo.
            </p>
          </div>
        </div>

        <div className="planta-alert warning">
          <strong>
            Equipo no seleccionado
          </strong>

          <span>
            Los componentes se gestionan
            únicamente cuando existe un equipo
            padre seleccionado.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Componentes</h3>

          <p>
            Equipo padre:{' '}
            <strong>
              {equipo.nombre}
            </strong>
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
              El equipo seleccionado todavía
              no tiene componentes registrados.
            </span>
          </div>
        )}

      {!loading &&
        componentes.length > 0 && (
          <>
            <div className="planta-list">
              {componentes.map(
                (componente) => (
                  <div
                    key={componente.id}
                    className="planta-list-item"
                  >
                    <button
                      type="button"
                      className="planta-list-main"
                      onClick={() =>
                        setComponenteSeleccionado(
                          componente
                        )
                      }
                    >
                      <div>
                        <strong>
                          {componente.nombre}
                        </strong>

                        {componente.descripcion && (
                          <small>
                            {
                              componente.descripcion
                            }
                          </small>
                        )}
                      </div>
                    </button>
                  </div>
                )
              )}
            </div>

            <SubcomponentesEstructura
              componente={
                componenteSeleccionado
              }
            />
          </>
        )}
    </section>
  );
}