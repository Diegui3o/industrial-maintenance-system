import { useEffect, useState } from 'react';

import {
  getEquiposPorSubproceso,
  type Equipo,
  type Subproceso,
} from '../../services/plantaApi';

interface Props {
  subproceso: Subproceso | null;
  onSelect: (
    equipo: Equipo | null
  ) => void;
}

export function EquipoEstructuraSelector({
  subproceso,
  onSelect,
}: Props) {
  const [
    equipos,
    setEquipos,
  ] = useState<Equipo[]>([]);

  const [
    equipoId,
    setEquipoId,
  ] = useState('');

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const cargar = async () => {
      setEquipoId('');
      onSelect(null);

      if (!subproceso) {
        setEquipos([]);
        return;
      }

      setLoading(true);

      try {
        const resultado =
          await getEquiposPorSubproceso(
            subproceso.id
          );

        setEquipos(resultado);
      } catch (error) {
        console.error(
          'Error cargando equipos:',
          error
        );

        setEquipos([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [subproceso?.id]);

  const seleccionar = (
    id: string
  ) => {
    setEquipoId(id);

    const equipo =
      equipos.find(
        (item) =>
          item.id.toString() === id
      ) || null;

    onSelect(equipo);
  };

  return (
    <div>
      <div className="planta-form">
        <label>
          Equipo padre
        </label>

        <select
          value={equipoId}
          disabled={
            !subproceso || loading
          }
          onChange={(e) =>
            seleccionar(
              e.target.value
            )
          }
        >
          <option value="">
            Seleccione un equipo
          </option>

          {equipos.map((equipo) => (
            <option
              key={equipo.id}
              value={equipo.id}
            >
              {equipo.nombre}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando equipos...
        </div>
      )}

      {!loading &&
        subproceso &&
        equipos.length === 0 && (
          <div className="planta-alert warning">
            <strong>
              No existen equipos
            </strong>

            <span>
              El subproceso seleccionado no
              tiene equipos asociados.
            </span>
          </div>
        )}
    </div>
  );
}