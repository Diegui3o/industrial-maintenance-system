import { useState } from 'react';

import { ProcesosEstructura } from '../Procesos/ProcesosEstructura';
import { SistemasEstructura } from '../Sistemas/SistemasEstructura';
import { SubprocesosPorEstructura } from '../Subprocesos/SubprocesosPorEstructura';
import { EquiposPorEstructura } from '../Equipos/EquiposPorEstructura';
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
    <div className="planta-layout">
      <aside className="planta-menu">
        <div className="planta-menu-title">
          Estructura
        </div>

        <button
          type="button"
          className={
            seccion === 'procesos'
              ? 'active'
              : ''
          }
          onClick={() => setSeccion('procesos')}
        >
          Procesos
        </button>

        <button
          type="button"
          className={
            seccion === 'sistemas'
              ? 'active'
              : ''
          }
          onClick={() => setSeccion('sistemas')}
        >
          Sistemas
        </button>

        <button
          type="button"
          className={
            seccion === 'subprocesos'
              ? 'active'
              : ''
          }
          onClick={() =>
            setSeccion('subprocesos')
          }
        >
          Subprocesos
        </button>

        <button
          type="button"
          className={
            seccion === 'equipos'
              ? 'active'
              : ''
          }
          onClick={() => setSeccion('equipos')}
        >
          Equipos
        </button>

        <button
          type="button"
          className={
            seccion === 'componentes'
              ? 'active'
              : ''
          }
          onClick={() =>
            setSeccion('componentes')
          }
        >
          Componentes
        </button>
      </aside>

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
          <EquiposPorEstructura />
        )}

        {seccion === 'componentes' && (
          <ComponentesEquipo />
        )}
      </main>
    </div>
  );
}