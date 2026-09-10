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
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Equipos</h3>

          <p>
            Seleccione primero el tipo de estructura
            y su subproceso padre.
          </p>
        </div>
      </div>

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
        <>
          <div className="planta-form">
            <label>
              Proceso padre
            </label>

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

          {!procesoId && (
            <div className="planta-alert warning">
              <strong>
                Seleccione un proceso
              </strong>

              <span>
                Primero seleccione el proceso
                padre.
              </span>
            </div>
          )}

          {procesoId && (
            <EquiposProcesoEstructura
              procesoId={procesoId}
              onSelectSubproceso={
                setSubprocesoProceso
              }
              subprocesoSeleccionado={
                subprocesoProceso
              }
            />
          )}
        </>
      )}

      {tipoPadre === 'sistema' && (
        <>
          <div className="planta-form">
            <label>
              Sistema padre
            </label>

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

          {!sistemaId && (
            <div className="planta-alert warning">
              <strong>
                Seleccione un sistema
              </strong>

              <span>
                Primero seleccione el sistema
                padre.
              </span>
            </div>
          )}

          {sistemaId && (
            <EquiposSistemaEstructura
              sistemaId={sistemaId}
              subprocesoSistemaId={
                subprocesoSistemaId
              }
              onChangeSubproceso={
                setSubprocesoSistemaId
              }
            />
          )}
        </>
      )}
    </section>
  );
}