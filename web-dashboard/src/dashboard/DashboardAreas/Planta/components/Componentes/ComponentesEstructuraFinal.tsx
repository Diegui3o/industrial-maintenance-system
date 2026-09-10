import { useEffect, useState } from 'react';

import {
  getComponentes,
  type Componente,
  type Equipo,
} from '../../services/plantaApi';

import { SubcomponentesEstructuraFinal } from './SubcomponentesEstructuraFinal';

interface Props {
  equipo: Equipo | null;
}

export function ComponentesEstructuraFinal({
  equipo,
}: Props) {
  const [componentes, setComponentes] =
    useState<Componente[]>([]);

  const [componenteId, setComponenteId] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const equipoId = equipo?.id ?? null;

  useEffect(() => {
    let activo = true;

    if (equipoId === null) {
      return () => {
        activo = false;
      };
    }

    const cargar = async () => {
      setLoading(true);

      try {
        const resultado =
          await getComponentes(equipoId);

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
  }, [equipoId]);

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
              <SubcomponentesEstructuraFinal
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