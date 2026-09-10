import { useEffect, useState } from 'react';

import {
  getSubprocesosSistema,
} from '../../services/plantaApi';

import { EquiposSubprocesoSistema } from './EquiposSubprocesoSistema';

interface SubprocesoSistema {
  id: number;
  sistema_id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

interface Props {
  sistemaId: string;
  subprocesoSistemaId: string;
  onChangeSubproceso: (
    id: string
  ) => void;
}

export function EquiposSistemaEstructura({
  sistemaId,
  subprocesoSistemaId,
  onChangeSubproceso,
}: Props) {
  const [
    subprocesos,
    setSubprocesos,
  ] = useState<SubprocesoSistema[]>([]);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const cargar = async () => {
      if (!sistemaId) {
        setSubprocesos([]);
        return;
      }

      setLoading(true);

      try {
        const resultado =
          await getSubprocesosSistema(
            Number(sistemaId)
          );

        setSubprocesos(resultado);
      } catch (error) {
        console.error(
          'Error cargando subprocesos de sistema:',
          error
        );

        setSubprocesos([]);
      } finally {
        setLoading(false);
      }
    };

    onChangeSubproceso('');
    cargar();
  }, [sistemaId]);

  return (
    <div>
      <div className="planta-form">
        <label>
          Subproceso padre
        </label>

        <select
          value={subprocesoSistemaId}
          onChange={(e) =>
            onChangeSubproceso(
              e.target.value
            )
          }
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
              El sistema seleccionado no tiene
              subprocesos disponibles.
            </span>
          </div>
        )}

      {!loading &&
        subprocesoSistemaId && (
          <EquiposSubprocesoSistema
            subprocesoSistemaId={
              Number(
                subprocesoSistemaId
              )
            }
          />
        )}
    </div>
  );
}