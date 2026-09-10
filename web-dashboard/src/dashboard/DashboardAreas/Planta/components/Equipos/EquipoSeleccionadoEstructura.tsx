import { useState } from 'react';

import type {
  Equipo,
} from '../../services/plantaApi';

interface Props {
  equipo: Equipo | null;
  onChange: (
    equipo: Equipo | null
  ) => void;
}

export function EquipoSeleccionadoEstructura({
  equipo,
  onChange,
}: Props) {
  const [activo, setActivo] =
    useState(!!equipo);

  if (!equipo) {
    return (
      <section className="planta-card">
        <div className="planta-card-header">
          <div>
            <h3>Equipo seleccionado</h3>

            <p>
              Seleccione un equipo para continuar
              con la estructura inferior.
            </p>
          </div>
        </div>

        <div className="planta-alert warning">
          <strong>
            No hay equipo seleccionado
          </strong>

          <span>
            Componentes, subcomponentes y
            repuestos aparecerán cuando se
            seleccione un equipo.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Equipo seleccionado</h3>

          <p>
            Equipo padre de la estructura
            inferior.
          </p>
        </div>

        <button
          type="button"
          className="planta-add-btn"
          onClick={() => {
            setActivo(!activo);

            if (activo) {
              onChange(null);
            }
          }}
        >
          {activo
            ? 'Cambiar equipo'
            : 'Mostrar equipo'}
        </button>
      </div>

      {activo && (
        <div className="planta-list">
          <div className="planta-list-item">
            <div className="planta-list-main">
              <div>
                <strong>
                  {equipo.nombre}
                </strong>

                {equipo.codigo && (
                  <small>
                    Código: {equipo.codigo}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}