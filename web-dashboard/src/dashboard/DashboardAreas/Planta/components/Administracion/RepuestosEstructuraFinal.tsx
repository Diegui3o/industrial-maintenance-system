import { useState } from 'react';

import type {
  Subcomponente,
} from '../../services/plantaApi';

import { RepuestosSubcomponente } from './RepuestosSubcomponente';

interface Props {
  subcomponente: Subcomponente | null;
}

export function RepuestosEstructuraFinal({
  subcomponente,
}: Props) {
  const [mostrar, setMostrar] =
    useState(true);

  if (!subcomponente) {
    return (
      <section className="planta-card">
        <div className="planta-card-header">
          <div>
            <h3>Repuestos</h3>

            <p>
              Seleccione primero un
              subcomponente.
            </p>
          </div>
        </div>

        <div className="planta-alert warning">
          <strong>
            Subcomponente no seleccionado
          </strong>

          <span>
            Los repuestos se gestionan
            directamente dentro del
            subcomponente seleccionado.
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="planta-card">

      <div className="planta-card-header">

        <div>
          <h3>Repuestos</h3>

          <p>
            Subcomponente padre:{' '}
            <strong>
              {subcomponente.nombre}
            </strong>
          </p>
        </div>

        <button
          type="button"
          className="planta-add-btn"
          onClick={() =>
            setMostrar(
              (actual) => !actual
            )
          }
        >
          {mostrar
            ? 'Ocultar'
            : 'Ver repuestos'}
        </button>

      </div>

      {mostrar && (
        <RepuestosSubcomponente
          subcomponente={
            subcomponente
          }
        />
      )}

    </section>
  );
}