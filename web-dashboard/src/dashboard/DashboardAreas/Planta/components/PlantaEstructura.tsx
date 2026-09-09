import { useEffect, useState } from 'react';

import { ProcesoList } from './ProcesoList';
import { SubprocesoList } from './SubprocesoList';
import { EquiposSubproceso } from './EquiposSubproceso';
import { RepuestosCatalogo } from './RepuestosCatalogo';
import { CatalogosPlanta } from './CatalogosPlanta';
import { EstadoEstructura } from './EstadoEstructura';

import {
  getProcesos,
  type Proceso,
  type Subproceso,
} from '../services/plantaApi';

type Nivel = 'procesos' | 'subprocesos' | 'equipos';

export function PlantaEstructura() {
  const [procesos, setProcesos] = useState<Proceso[]>([]);
  const [proceso, setProceso] = useState<Proceso | null>(null);
  const [subproceso, setSubproceso] =
    useState<Subproceso | null>(null);

  const [nivel, setNivel] = useState<Nivel>('procesos');
  const [loading, setLoading] = useState(true);

  const cargarProcesos = async () => {
    setLoading(true);

    try {
      setProcesos(await getProcesos());
    } catch (error) {
      console.error('Error cargando procesos:', error);
      setProcesos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProcesos();
  }, []);

  const seleccionarProceso = (item: Proceso) => {
    setProceso(item);
    setSubproceso(null);
    setNivel('subprocesos');
  };

  const seleccionarSubproceso = (item: Subproceso) => {
    setSubproceso(item);
    setNivel('equipos');
  };

  const volverAProcesos = () => {
    setProceso(null);
    setSubproceso(null);
    setNivel('procesos');
  };

  const volverASubprocesos = () => {
    setSubproceso(null);
    setNivel('subprocesos');
  };

  return (
    <div className="planta-estructura">

      <div className="planta-header">
        <div>
          <h2>Estructura de Planta</h2>
          <p>
            Organiza la planta desde el proceso hasta los equipos.
          </p>
        </div>
      </div>

      <div className="planta-breadcrumb">
        <button
          className={nivel === 'procesos' ? 'current' : ''}
          onClick={volverAProcesos}
        >
          1. Procesos
        </button>

        <span>›</span>

        <button
          disabled={!proceso}
          className={nivel === 'subprocesos' ? 'current' : ''}
          onClick={volverASubprocesos}
        >
          2. Subprocesos
        </button>

        <span>›</span>

        <button
          disabled={!subproceso}
          className={nivel === 'equipos' ? 'current' : ''}
        >
          3. Equipos
        </button>
      </div>

      <div className="planta-contexto">
        <div>
          <span>Ubicación actual</span>

          <strong>
            {proceso?.nombre || 'Seleccione un proceso'}
            {subproceso && ` › ${subproceso.nombre}`}
          </strong>
        </div>

        {proceso && (
          <button onClick={volverAProcesos}>
            Cambiar proceso
          </button>
        )}
      </div>

      <div className="planta-estructura-grid">

        <ProcesoList
          procesos={procesos}
          seleccionado={proceso}
          loading={loading}
          onSelect={seleccionarProceso}
          onReload={cargarProcesos}
        />

        <SubprocesoList
          proceso={proceso}
          seleccionado={subproceso}
          onSelect={seleccionarSubproceso}
        />

      </div>

      <div style={{ marginTop: 20 }}>
        <EquiposSubproceso
          subproceso={subproceso}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <RepuestosCatalogo />
      </div>
      
      <div style={{ marginTop: 20 }}>
        <CatalogosPlanta />
      </div>

      <div style={{ marginTop: 20 }}>
        <EstadoEstructura />
      </div>

    </div>
  );
}