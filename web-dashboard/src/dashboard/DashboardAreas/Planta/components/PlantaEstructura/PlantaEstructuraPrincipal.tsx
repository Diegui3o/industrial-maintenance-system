import { useState } from 'react';

import { ProcesosEstructura } from '../Procesos/ProcesosEstructura';
import { SistemasEstructura } from '../Sistemas/SistemasEstructura';
import { SubprocesosPorEstructura } from '../Subprocesos/SubprocesosPorEstructura';
import { EquiposPorEstructura } from '../Equipos/EquiposPorEstructura';
import { EquiposLista } from '../Equipos/EquiposLista';
import { ComponentesEquipo } from '../Componentes/ComponentesEquipo';

type Seccion =
  | 'procesos'
  | 'sistemas'
  | 'subprocesos'
  | 'equipos'
  | 'componentes';

export function PlantaEstructuraPrincipal() {
  const [seccion, setSeccion] =
    useState<Seccion>('procesos');

  return (
    <div className="planta-estructura">

      <div className="planta-estructura-tabs">

        <button
          type="button"
          className={`planta-estructura-btn ${
            seccion === 'procesos'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setSeccion('procesos')
          }
        >
          Procesos
        </button>

        <button
          type="button"
          className={`planta-estructura-btn ${
            seccion === 'sistemas'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setSeccion('sistemas')
          }
        >
          Sistemas
        </button>

        <button
          type="button"
          className={`planta-estructura-btn ${
            seccion === 'subprocesos'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setSeccion('subprocesos')
          }
        >
          Subprocesos
        </button>

        <button
          type="button"
          className={`planta-estructura-btn ${
            seccion === 'equipos'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setSeccion('equipos')
          }
        >
          Equipos
        </button>

        <button
          type="button"
          className={`planta-estructura-btn ${
            seccion === 'componentes'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            setSeccion('componentes')
          }
        >
          Componentes
        </button>

      </div>

      <main className="planta-content">

        {seccion === 'procesos' && (
          <ProcesosEstructura />
        )}

        {seccion === 'sistemas' && (
          <SistemasEstructura />
        )}

        {seccion === 'subprocesos' && (
          <SubprocesosPorEstructura />
        )}

        {seccion === 'equipos' && (
          <>
            <EquiposPorEstructura />

            <EquiposLista />
          </>
        )}

        {seccion === 'componentes' && (
          <ComponentesEquipo />
        )}

      </main>
    </div>
  );
}