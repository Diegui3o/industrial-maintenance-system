import { useEffect, useState } from 'react';

import { type Componente } from '../../services/plantaComponentesApi';

import {
  getEquipos,
  type Equipo,
} from '../../services/plantaEquiposApi';

import { ComponentesCatalogo } from './ComponentesCatalogo';
import { ComponentePanel } from './ComponentePanel';
import { ComponenteFicha } from './ComponenteFicha';

import './Componentes.css';

export function ComponentesEquipo() {
  const [panelAbierto, setPanelAbierto] = useState(false);

  const [catalogoVersion, setCatalogoVersion] =
    useState(0);

  const [componenteSeleccionado, setComponenteSeleccionado] =
    useState<Componente | null>(null);

  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  useEffect(() => {
    getEquipos()
      .then((resultado) => {
        setEquipos(resultado);
      })
      .catch((error) => {
        console.error(
          'Error cargando equipos para la ficha:',
          error
        );
      });
  }, []);

  useEffect(() => {
    if (!componenteSeleccionado) {
      return;
    }

    const manejarAtras = () => {
      setComponenteSeleccionado(null);
    };

    window.addEventListener(
      'popstate',
      manejarAtras
    );

    return () => {
      window.removeEventListener(
        'popstate',
        manejarAtras
      );
    };
  }, [componenteSeleccionado]);

  function componenteGuardado() {
    setPanelAbierto(false);

    setCatalogoVersion(
      (actual) => actual + 1
    );
  }

  function abrirComponente(componente: Componente) {
    window.history.pushState(
      {
        pantalla: 'componente',
        componenteId: componente.id,
      },
      '',
      `#componente-${componente.id}`
    );

    setComponenteSeleccionado(componente);
  }

  function volverComponentes() {
    if (window.location.hash.startsWith('#componente-')) {
      window.history.back();
      return;
    }

    setComponenteSeleccionado(null);
  }

  if (componenteSeleccionado) {
    const equipo = equipos.find(
      (item) =>
        item.id === componenteSeleccionado.equipo_id
    );

    return (
      <section className="componentes-seccion">
        <ComponenteFicha
          componente={componenteSeleccionado}
          equipo={equipo}
          onVolver={volverComponentes}
        />
      </section>
    );
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
          onVer={abrirComponente}
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