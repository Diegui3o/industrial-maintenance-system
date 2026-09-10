import { useState } from 'react';

import type {
  Equipo,
  Subproceso,
} from '../../services/plantaApi';

import { EquiposEstructura } from '../Equipos/EquiposEstructura';
import { EquipoEstructuraSelector } from '../Equipos/EquipoEstructuraSelector';
import { EquipoSeleccionado } from '../Equipos/EquipoSeleccionado';
import { ComponentesEstructuraFinal } from './ComponentesEstructuraFinal';

export function PlantaEstructuraCompleta() {
    const [
    subproceso,
    ] = useState<Subproceso | null>(
    null
    );

  const [
    equipo,
    setEquipo,
  ] = useState<Equipo | null>(null);

  return (
    <div className="planta-estructura">

      <EquiposEstructura />

      <section className="planta-card">
        <div className="planta-card-header">
          <div>
            <h3>
              Selección de equipo
            </h3>

            <p>
              Seleccione el subproceso y luego
              el equipo que desea administrar.
            </p>
          </div>
        </div>

        <EquipoEstructuraSelector
          subproceso={subproceso}
          onSelect={setEquipo}
        />

        <EquipoSeleccionado
          equipo={equipo}
          onClear={() =>
            setEquipo(null)
          }
        />
      </section>

      <ComponentesEstructuraFinal
        equipo={equipo}
      />

    </div>
  );
}