import { useEffect, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  type Proceso,
  type SistemaPlanta,
  type Subproceso,
} from '../../services/plantaApi';

import { EquiposProcesoEstructura } from './EquiposProcesoEstructura';
import { EquiposSistemaEstructura } from './EquiposSistemaEstructura';

type TipoPadre =
  | 'proceso'
  | 'sistema'
  | '';

export function EquiposEstructura() {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [tipoPadre, setTipoPadre] =
    useState<TipoPadre>('');

  const [procesoId, setProcesoId] =
    useState('');

  const [sistemaId, setSistemaId] =
    useState('');

  const [
    subprocesoProceso,
    setSubprocesoProceso,
  ] = useState<Subproceso | null>(null);

  const [
    subprocesoSistemaId,
    setSubprocesoSistemaId,
  ] = useState('');

  const [loading, setLoading] =
    useState(true);

  const cargarPadres = async () => {
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
        'Error cargando padres de equipos:',
        error
      );

      setProcesos([]);
      setSistemas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPadres();
  }, []);

  const cambiarTipoPadre = (
    tipo: TipoPadre
  ) => {
    setTipoPadre(tipo);
    setProcesoId('');
    setSistemaId('');
    setSubprocesoProceso(null);
    setSubprocesoSistemaId('');
  };

  const cambiarProceso = (
    id: string
  ) => {
    setProcesoId(id);
    setSubprocesoProceso(null);
  };

  const cambiarSistema = (
    id: string
  ) => {
    setSistemaId(id);
    setSubprocesoSistemaId('');
  };

  if (loading) {
    return (
      <section className="planta-card">
        <div className="planta-empty">
          Cargando estructura de equipos...
        </div>
      </section>
    );
  }

  return (
    <section className="planta-card planta-equipos-card">
      <div className="planta-card-header">
        <div>
          <span className="planta-section-label">
            ESTRUCTURA
          </span>

          <h3>Equipos</h3>

          <p>
            Seleccione el proceso o sistema y luego
            el subproceso al que desea asociar equipos.
          </p>
        </div>
      </div>

      <div className="planta-steps">

        {/* PASO 1 */}

        <div className="planta-step">
          <div className="planta-step-number">
            1
          </div>

          <div className="planta-step-content">
            <span className="planta-step-label">
              TIPO DE ESTRUCTURA
            </span>

            <select
              value={tipoPadre}
              onChange={(e) =>
                cambiarTipoPadre(
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
        </div>

        {/* PASO 2 — PROCESO */}

        {tipoPadre === 'proceso' && (
          <div className="planta-step">
            <div className="planta-step-number">
              2
            </div>

            <div className="planta-step-content">
              <span className="planta-step-label">
                PROCESO PADRE
              </span>

              <select
                value={procesoId}
                onChange={(e) =>
                  cambiarProceso(
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
          </div>
        )}

        {/* PASO 2 — SISTEMA */}

        {tipoPadre === 'sistema' && (
          <div className="planta-step">
            <div className="planta-step-number">
              2
            </div>

            <div className="planta-step-content">
              <span className="planta-step-label">
                SISTEMA PADRE
              </span>

              <select
                value={sistemaId}
                onChange={(e) =>
                  cambiarSistema(
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
          </div>
        )}

        {/* PASO 3 — SUBPROCESO */}

        {tipoPadre === 'proceso' &&
          procesoId && (
            <div className="planta-step">
              <div className="planta-step-number">
                3
              </div>

              <div className="planta-step-content">
                <span className="planta-step-label">
                  SUBPROCESO PADRE
                </span>

                <EquiposProcesoEstructura
                  procesoId={Number(procesoId)}
                  onSelectSubproceso={
                    setSubprocesoProceso
                  }
                  subprocesoSeleccionado={
                    subprocesoProceso
                  }
                />
              </div>
            </div>
          )}

        {tipoPadre === 'sistema' &&
          sistemaId && (
            <div className="planta-step">
              <div className="planta-step-number">
                3
              </div>

              <div className="planta-step-content">
                <span className="planta-step-label">
                  SUBPROCESO PADRE
                </span>

                <EquiposSistemaEstructura
                  sistemaId={sistemaId}
                  subprocesoSistemaId={
                    subprocesoSistemaId
                  }
                  onChangeSubproceso={
                    setSubprocesoSistemaId
                  }
                />
              </div>
            </div>
          )}

      </div>
    </section>
  );
}