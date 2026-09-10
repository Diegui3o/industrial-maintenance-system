import { useEffect, useState } from 'react';

import {
  getSistemas,
  type SistemaPlanta,
} from '../../services/plantaApi';

import { SistemaList } from './SistemaList';

export function SistemasEstructura() {
  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [loading, setLoading] =
    useState(true);

  const cargar = async () => {
    setLoading(true);

    try {
      const resultado =
        await getSistemas();

      setSistemas(resultado);
    } catch (error) {
      console.error(
        'Error cargando sistemas:',
        error
      );

      setSistemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div>
      {loading ? (
        <div className="planta-empty">
          Cargando sistemas...
        </div>
      ) : (
        <SistemaList
          sistemas={sistemas}
          onReload={cargar}
        />
      )}
    </div>
  );
}