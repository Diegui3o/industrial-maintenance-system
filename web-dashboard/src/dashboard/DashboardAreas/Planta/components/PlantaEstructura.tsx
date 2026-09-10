import { useEffect, useState } from 'react';

import { ProcesoList } from './Procesos/ProcesoList';
import { SistemaList } from './Sistemas/SistemaList';

import {
  getProcesos,
  getSistemas,
  type Proceso,
  type SistemaPlanta,
} from '../services/plantaApi';

export function PlantaEstructura() {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [loading, setLoading] =
    useState(true);

  const cargar = async () => {
    setLoading(true);

    try {
      const [
        procesosResultado,
        sistemasResultado,
      ] = await Promise.all([
        getProcesos(),
        getSistemas(),
      ]);

      setProcesos(procesosResultado);
      setSistemas(sistemasResultado);
    } catch (error) {
      console.error(
        'Error cargando estructura de planta:',
        error
      );

      setProcesos([]);
      setSistemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="planta-estructura">
      {loading ? (
        <div className="planta-empty">
          Cargando estructura...
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: 20,
            }}
          >
            <ProcesoList
              procesos={procesos}
              loading={loading}
              onReload={cargar}
            />

            <SistemaList
              sistemas={sistemas}
              onReload={cargar}
            />
          </div>
        </>
      )}
    </div>
  );
}