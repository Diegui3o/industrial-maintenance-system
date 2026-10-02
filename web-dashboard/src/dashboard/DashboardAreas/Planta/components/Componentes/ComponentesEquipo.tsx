import { useState } from 'react';

import { ComponentesCatalogo } from './ComponentesCatalogo';
import { ComponentePanel } from './ComponentePanel';

import './Componentes.css';

export function ComponentesEquipo() {
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [catalogoVersion, setCatalogoVersion] = useState(0);

  function componenteGuardado() {
    setPanelAbierto(false);
    setCatalogoVersion((actual) => actual + 1);
  }

  return (
    <section className="componentes-seccion">
      <div className="componentes-header">
        <div>
          <span className="componentes-kicker">
            CATÁLOGO TÉCNICO
          </span>

          <h2>Componentes</h2>

          <p>
            Administración y consulta de componentes asociados a los equipos de planta.
          </p>
        </div>

        <button
          type="button"
          className="componentes-btn"
          onClick={() => setPanelAbierto(true)}
        >
          + Crear componente
        </button>
      </div>

      <div className="componentes-card">
        <ComponentesCatalogo
          key={catalogoVersion}
          onCrear={() => setPanelAbierto(true)}
        />

        <ComponentePanel
          abierto={panelAbierto}
          onCerrar={() => setPanelAbierto(false)}
          onGuardado={componenteGuardado}
        />
      </div>
    </section>
  );
}
