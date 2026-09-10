import { useEffect, useState } from 'react';

import {
  getEquiposPorSubproceso,
  type Equipo,
} from '../../services/plantaApi';

interface Props {
  subprocesoId: number;
  subprocesoNombre: string;
  onSelectEquipo?: (
    equipo: Equipo | null
  ) => void;
}

export function EquiposSubprocesoFinal({
  subprocesoId,
  subprocesoNombre,
  onSelectEquipo,
}: Props) {
  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [equipoId, setEquipoId] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);

      try {
        const resultado =
          await getEquiposPorSubproceso(
            subprocesoId
          );

        if (!activo) return;

        setEquipos(resultado);
      } catch (error) {
        if (!activo) return;

        console.error(
          'Error cargando equipos:',
          error
        );

        setEquipos([]);
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, [subprocesoId]);

  const seleccionarEquipo = (
    id: string
  ) => {
    setEquipoId(id);

    const equipo =
      equipos.find(
        (item) =>
          item.id.toString() === id
      ) || null;

    onSelectEquipo?.(equipo);
  };

  return (
    <div>
      <div className="planta-card-header">
        <div>
          <h4>Equipos</h4>

          <p>
            Subproceso padre:{' '}
            <strong>
              {subprocesoNombre}
            </strong>
          </p>
        </div>
      </div>

      <div className="planta-form">
        <label>
          Equipo padre
        </label>

        <select
          value={equipoId}
          disabled={loading}
          onChange={(e) =>
            seleccionarEquipo(
              e.target.value
            )
          }
        >
          <option value="">
            {loading
              ? 'Cargando equipos...'
              : 'Seleccione un equipo'}
          </option>

          {equipos.map((equipo) => (
            <option
              key={equipo.id}
              value={equipo.id}
            >
              {equipo.codigo
                ? `${equipo.codigo} — ${equipo.nombre}`
                : equipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {!loading &&
        equipos.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No existen equipos
            </strong>

            <span>
              El subproceso seleccionado
              todavía no tiene equipos
              asociados.
            </span>
          </div>
        )}
    </div>
  );
}