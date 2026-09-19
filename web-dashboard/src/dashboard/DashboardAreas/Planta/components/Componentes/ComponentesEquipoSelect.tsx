import type {
  Proceso,
  SistemaPlanta,
} from '../../services/plantaApi';

import type { TipoPadre } from './useComponentesEquipo';

interface Props {
  tipoPadre: TipoPadre;
  procesos: Proceso[];
  sistemas: SistemaPlanta[];
  subprocesosDisponibles: Array<{
    id: number;
    nombre: string;
  }>;
  procesoId: number | null;
  sistemaId: number | null;
  subprocesoId: number | null;
  seleccionarTipo: (valor: TipoPadre) => void;
  seleccionarProceso: (valor: string) => void;
  seleccionarSistema: (valor: string) => void;
  seleccionarSubproceso: (valor: string) => void;
}

export function ComponentesEquipoSelect({
  tipoPadre,
  procesos,
  sistemas,
  subprocesosDisponibles,
  procesoId,
  sistemaId,
  subprocesoId,
  seleccionarTipo,
  seleccionarProceso,
  seleccionarSistema,
  seleccionarSubproceso,
}: Props) {
  return (
    <>
      <div className="planta-form">
        <label>Tipo de estructura</label>

        <select
          value={tipoPadre}
          onChange={(e) =>
            seleccionarTipo(
              e.target.value as TipoPadre
            )
          }
        >
          <option value="">
            Seleccione una opción
          </option>

          <option value="proceso">
            Proceso
          </option>

          <option value="sistema">
            Sistema
          </option>
        </select>
      </div>

      {tipoPadre === 'proceso' && (
        <div className="planta-form">
          <label>Proceso padre</label>

          <select
            value={procesoId ?? ''}
            onChange={(e) =>
              seleccionarProceso(
                e.target.value
              )
            }
          >
            <option value="">
              Seleccione un proceso
            </option>

            {procesos.map((proceso) => (
              <option
                key={proceso.id}
                value={proceso.id}
              >
                {proceso.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {tipoPadre === 'sistema' && (
        <div className="planta-form">
          <label>Sistema padre</label>

          <select
            value={sistemaId ?? ''}
            onChange={(e) =>
              seleccionarSistema(
                e.target.value
              )
            }
          >
            <option value="">
              Seleccione un sistema
            </option>

            {sistemas.map((sistema) => (
              <option
                key={sistema.id}
                value={sistema.id}
              >
                {sistema.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {(
        (tipoPadre === 'proceso' && procesoId) ||
        (tipoPadre === 'sistema' && sistemaId)
      ) && (
        <div className="planta-form">
          <label>Subproceso padre</label>

          <select
            value={subprocesoId ?? ''}
            onChange={(e) =>
              seleccionarSubproceso(
                e.target.value
              )
            }
          >
            <option value="">
              Seleccione un subproceso
            </option>

            {subprocesosDisponibles.map(
              (subproceso) => (
                <option
                  key={subproceso.id}
                  value={subproceso.id}
                >
                  {subproceso.nombre}
                </option>
              )
            )}
          </select>
        </div>
      )}
    </>
  );
}