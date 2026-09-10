import { useEffect, useState } from 'react';

import {
  getSubcomponentes,
  type Componente,
  type Subcomponente,
} from '../../services/plantaApi';

import { SubcomponentePadreSelector } from './SubcomponentePadreSelector';
import { RepuestosEstructura } from '../Administracion/RepuestosEstructura';

interface Props {
  componente: Componente | null;
}

export function SubcomponentesEstructura({
  componente,
}: Props) {
  const [
    subcomponentes,
    setSubcomponentes,
  ] = useState<Subcomponente[]>([]);

  const [
    subcomponenteId,
    setSubcomponenteId,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  const cargar = async () => {
    if (!componente) {
      setSubcomponentes([]);
      setSubcomponenteId('');
      return;
    }

    setLoading(true);

    try {
      const resultado =
        await getSubcomponentes(
          componente.id
        );

      setSubcomponentes(resultado);
    } catch (error) {
      console.error(
        'Error cargando subcomponentes:',
        error
      );

      setSubcomponentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSubcomponenteId('');
    cargar();
  }, [componente?.id]);

  const seleccionado =
    subcomponentes.find(
      (item) =>
        item.id.toString() ===
        subcomponenteId
    ) || null;

  if (!componente) {
    return (
      <div className="planta-card">
        <div className="planta-card-header">
          <div>
            <h3>
              Subcomponentes
            </h3>

            <p>
              Seleccione primero un
              componente.
            </p>
          </div>
        </div>

        <div className="planta-alert warning">
          <strong>
            Componente no seleccionado
          </strong>

          <span>
            Los subcomponentes pertenecen
            directamente a un componente.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>
            Subcomponentes
          </h3>

          <p>
            Componente padre:{' '}
            <strong>
              {componente.nombre}
            </strong>
          </p>
        </div>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando subcomponentes...
        </div>
      )}

      {!loading &&
        subcomponentes.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No existen subcomponentes
            </strong>

            <span>
              El componente seleccionado
              todavía no tiene
              subcomponentes.
            </span>
          </div>
        )}

      {!loading &&
        subcomponentes.length > 0 && (
          <>
            <SubcomponentePadreSelector
              subcomponentes={
                subcomponentes
              }
              value={
                subcomponenteId
              }
              onChange={
                setSubcomponenteId
              }
            />

            {seleccionado && (
              <RepuestosEstructura
                subcomponente={
                  seleccionado
                }
              />
            )}
          </>
        )}
    </div>
  );
}