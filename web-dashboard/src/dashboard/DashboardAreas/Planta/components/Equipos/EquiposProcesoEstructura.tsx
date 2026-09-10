import { useEffect, useState } from 'react';

import {
  getSubprocesos,
  type Subproceso,
} from '../../services/plantaApi';

import { EquiposSubproceso } from './EquiposSubproceso';

interface Props {
  procesoId: string;
  subprocesoSeleccionado: Subproceso | null;
  onSelectSubproceso: (
    subproceso: Subproceso | null
  ) => void;
  onSelectEquipo?: (equipo: any) => void;
}

export function EquiposProcesoEstructura({
  procesoId,
  subprocesoSeleccionado,
  onSelectSubproceso,
  onSelectEquipo,
}: Props) {
  const [
    subprocesos,
    setSubprocesos,
  ] = useState<Subproceso[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const cargar = async () => {
      if (!procesoId) {
        setSubprocesos([]);
        return;
      }

      setLoading(true);

      try {
        const resultado =
          await getSubprocesos(
            Number(procesoId)
          );

        setSubprocesos(resultado);
      } catch (error) {
        console.error(
          'Error cargando subprocesos para equipos:',
          error
        );

        setSubprocesos([]);
      } finally {
        setLoading(false);
      }
    };

    onSelectSubproceso(null);
    cargar();
  }, [procesoId]);

  return (
    <div>
      <div className="planta-form">
        <label>
          Subproceso padre
        </label>

        <select
          value={
            subprocesoSeleccionado?.id
              ?.toString() || ''
          }
          onChange={(e) => {
            const seleccionado =
              subprocesos.find(
                (item) =>
                  item.id.toString() ===
                  e.target.value
              ) || null;

            onSelectSubproceso(
              seleccionado
            );
          }}
        >
          <option value="">
            Seleccione un subproceso
          </option>

          {subprocesos.map((subproceso) => (
            <option
              key={subproceso.id}
              value={subproceso.id}
            >
              {subproceso.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando subprocesos...
        </div>
      )}

      {!loading &&
        subprocesos.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No existen subprocesos
            </strong>

            <span>
              El proceso seleccionado no tiene
              subprocesos disponibles.
            </span>
          </div>
        )}

      {!loading &&
        subprocesoSeleccionado && (
          <EquiposSubproceso
            subproceso={
              subprocesoSeleccionado
            }
            onSelectEquipo={
              onSelectEquipo
            }
          />
        )}
    </div>
  );
}