import { useEffect, useState } from 'react';

import {
  getComponentes,
  type Componente,
  type Equipo,
} from '../../services/plantaApi';

import { SubcomponentesEstructuraCompleta } from './SubcomponentesEstructuraCompleta';

interface Props {
  equipo: Equipo | null;
}

export function ComponentesEstructuraCompleta({
  equipo,
}: Props) {
  const [componentes, setComponentes] =
    useState<Componente[]>([]);

  const [componenteId, setComponenteId] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      if (!equipo) {
        return;
      }

      setLoading(true);

      try {
        const resultado =
          await getComponentes(
            equipo.id
          );

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

    cargar();

    return () => {
      activo = false;
    };
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
            Los componentes aparecerán
            cuando seleccione un equipo.
          </span>
        </div>

      </section>
    );
  }

  const componenteSeleccionado =
    componentes.find(
      (item) =>
        item.id.toString() ===
        componenteId
    ) || null;

  return (
    <section className="planta-card">

      <div className="planta-card-header">

        <div>
          <h3>Componentes</h3>

          <p>
            Equipo padre:{' '}
            <strong>
              {equipo.codigo
                ? `${equipo.codigo} — `
                : ''}
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
            <div className="planta-form">

              <label>
                Componente padre
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

    </section>
  );
}