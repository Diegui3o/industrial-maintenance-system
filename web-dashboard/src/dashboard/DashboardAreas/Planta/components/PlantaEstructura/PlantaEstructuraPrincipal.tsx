import { useState } from 'react';

import type {
  Equipo,
} from '../../services/plantaApi';

import { ProcesosEstructura } from '../Procesos/ProcesosEstructura';
import { SistemasEstructura } from '../Sistemas/SistemasEstructura';
import { SubprocesosEstructuraNueva } from '../Subprocesos/SubprocesosEstructuraNueva';
import { EquiposEstructuraFinal } from '../Equipos/EquiposEstructuraFinal';
import { ComponentesEstructuraCompleta } from '../Componentes/ComponentesEstructuraCompleta';

export function PlantaEstructuraPrincipal() {
  const [
    equipoSeleccionado,
    setEquipoSeleccionado,
  ] = useState<Equipo | null>(null);

  return (
    <div className="planta-estructura">

      {/* PROCESOS Y SISTEMAS */}

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

      {/* SUBPROCESOS */}

      <div style={{ marginBottom: 20 }}>
        <SubprocesosEstructuraNueva />
      </div>

      {/* EQUIPOS */}

      <div style={{ marginBottom: 20 }}>
        <EquiposEstructuraFinal
          onSelectEquipo={
            setEquipoSeleccionado
          }
        />
      </div>

      {/* COMPONENTES → SUBCOMPONENTES → REPUESTOS */}

      <ComponentesEstructuraCompleta
        equipo={
          equipoSeleccionado
        }
      />

    </div>
  );
}