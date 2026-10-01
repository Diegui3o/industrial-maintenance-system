import { useState } from 'react';

import { MaestroComponentesSelector } from './components/MaestroComponentesSelector';
import { MaestroComponentesTabla } from './components/MaestroComponentesTabla';

import { TIPOS_COMPONENTE_BASE } from './tipos/tiposComponente';

import './MaestrosComponentes.css';

export function MaestrosComponentes() {
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState<string>(
      TIPOS_COMPONENTE_BASE[0],
    );

  return (
    <section className="maestros-componentes">
      <div className="maestros-componentes-header">
        <div className="maestros-componentes-titulo">
          <h2>Maestros de Componentes</h2>

          <span>
            Información técnica organizada por tipo de componente.
          </span>
        </div>

        <MaestroComponentesSelector
          tipos={[...TIPOS_COMPONENTE_BASE]}
          tipoSeleccionado={tipoSeleccionado}
          onChange={setTipoSeleccionado}
        />
      </div>

      <MaestroComponentesTabla
        tipoSeleccionado={tipoSeleccionado}
      />
    </section>
  );
}