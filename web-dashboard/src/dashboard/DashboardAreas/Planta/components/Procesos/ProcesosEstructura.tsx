import { useEffect, useState } from 'react';

import {
  getProcesos,
  type Proceso,
} from '../../services/plantaApi';

import { ProcesoList } from './ProcesoList';

export function ProcesosEstructura() {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [loading, setLoading] =
    useState(true);

  const cargar = async () => {
    setLoading(true);

    try {
      const resultado = await getProcesos();

      setProcesos(resultado);
    } catch (error) {
      console.error(
        'Error cargando procesos:',
        error
      );

      setProcesos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <ProcesoList
      procesos={procesos}
      loading={loading}
      onReload={cargar}
    />
  );
}