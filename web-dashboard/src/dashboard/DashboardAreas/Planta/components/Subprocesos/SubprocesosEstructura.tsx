import { useEffect, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  type Proceso,
  type SistemaPlanta,
  type Subproceso,
} from '../../services/plantaApi';

import { SubprocesoList } from './SubprocesoList';
import { SubprocesoProcesoSelector } from './SubprocesoProcesoSelector';
import { SubprocesoSistemaSelector } from './SubprocesoSistemaSelector';

interface Props {
  onSelectSubproceso?: (
    subproceso: Subproceso
  ) => void;
}

type TipoPadre =
  | 'proceso'
  | 'sistema'
  | '';

export function SubprocesosEstructura({
  onSelectSubproceso,
}: Props) {
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
        'Error cargando padres de subprocesos:',
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
  };

  const seleccionarSubproceso = (
    subproceso: Subproceso
  ) => {
    onSelectSubproceso?.(subproceso);
  };

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Subprocesos</h3>

          <p>
            Los subprocesos pertenecen a un
            proceso o a un sistema.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="planta-empty">
          Cargando procesos y sistemas...
        </div>
      ) : (
        <>
          <div className="planta-form">

            <label>
              Tipo de estructura
            </label>

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

          {tipoPadre === 'proceso' && (
            <SubprocesoProcesoSelector
              procesos={procesos}
              procesoId={procesoId}
              onChange={setProcesoId}
            />
          )}

          {tipoPadre === 'sistema' && (
            <SubprocesoSistemaSelector
              sistemas={sistemas}
              sistemaId={sistemaId}
              onChange={setSistemaId}
            />
          )}

          {!tipoPadre && (
            <div className="planta-alert warning">
              <strong>
                Seleccione el tipo de estructura
              </strong>

              <span>
                Primero indique si el subproceso
                pertenece a un proceso o a un
                sistema.
              </span>
            </div>
          )}

          {tipoPadre === 'proceso' &&
            !procesoId && (
              <div className="planta-alert warning">
                <strong>
                  Seleccione un proceso
                </strong>

                <span>
                  Debe seleccionar el proceso
                  padre antes de gestionar sus
                  subprocesos.
                </span>
              </div>
            )}

          {tipoPadre === 'sistema' &&
            !sistemaId && (
              <div className="planta-alert warning">
                <strong>
                  Seleccione un sistema
                </strong>

                <span>
                  Debe seleccionar el sistema
                  padre antes de gestionar sus
                  subprocesos.
                </span>
              </div>
            )}

          {tipoPadre === 'proceso' &&
            procesoId && (
              <SubprocesoList
                procesos={procesos.filter(
                  (proceso) =>
                    proceso.id.toString() ===
                    procesoId
                )}
                onSelect={
                  seleccionarSubproceso
                }
              />
            )}

          {tipoPadre === 'sistema' &&
            sistemaId && (
              <div className="planta-alert warning">
                <strong>
                  Subprocesos de sistema
                </strong>

                <span>
                  Aquí conectaremos el componente
                  existente de subprocesos de
                  sistemas.
                </span>
              </div>
            )}
        </>
      )}

    </section>
  );
}