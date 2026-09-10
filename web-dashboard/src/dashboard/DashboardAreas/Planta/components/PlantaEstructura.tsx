import { useState } from 'react';

import type {
  Equipo,
} from '../services/plantaApi';

import { ProcesosEstructura } from './Procesos/ProcesosEstructura';
import { SistemasEstructura } from './Sistemas/SistemasEstructura';
import { EquiposEstructura } from './Equipos/EquiposEstructura';
import { ComponentesEstructura } from './Componentes/ComponentesEstructura';
import { EquipoSeleccionadoEstructura } from './Equipos/EquipoSeleccionadoEstructura';

export function PlantaEstructura() {
  const [
    equipoSeleccionado,
    setEquipoSeleccionado,
  ] = useState<Equipo | null>(null);

  return (
    <div className="planta-estructura">

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(2, minmax(0, 1fr))',
          gap: 20,
          marginBottom: 20,
        }}
      >
        <ProcesosEstructura />

        <SistemasEstructura />
      </div>

      <div style={{ marginBottom: 20 }}>
        <EquiposEstructura />
      </div>

      <EquipoSeleccionadoEstructura
        equipo={equipoSeleccionado}
        onChange={setEquipoSeleccionado}
      />

      <ComponentesEstructura
        equipo={equipoSeleccionado}
      />

    </div>
  );
}