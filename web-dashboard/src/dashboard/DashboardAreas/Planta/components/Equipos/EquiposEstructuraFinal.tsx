import { useEffect, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  getSubprocesos,
  getSubprocesosSistema,
  type Equipo,
  type Proceso,
  type SistemaPlanta,
} from '../../services/plantaApi';

import { EquiposSubprocesoFinal } from './EquiposSubprocesoFinal';

type TipoPadre =
  | 'proceso'
  | 'sistema'
  | '';

interface Props {
  onSelectEquipo?: (
    equipo: Equipo | null
  ) => void;
}

interface SubprocesoSistema {
  id: number;
  sistema_id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export function EquiposEstructuraFinal({
  onSelectEquipo,
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

  const [
    subprocesosProceso,
    setSubprocesosProceso,
  ] = useState<
    {
      id: number;
      nombre: string;
      descripcion?: string | null;
    }[]
  >([]);

  const [
    subprocesosSistema,
    setSubprocesosSistema,
  ] = useState<SubprocesoSistema[]>([]);

  const [subprocesoId, setSubprocesoId] =
    useState('');

  const [loadingPadres, setLoadingPadres] =
    useState(true);

  const [
    loadingSubprocesos,
    setLoadingSubprocesos,
  ] = useState(false);

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      try {
        const [
          procesosResultado,
          sistemasResultado,
        ] = await Promise.all([
          getProcesos(),
          getSistemas(),
        ]);

        if (!activo) return;

        setProcesos(procesosResultado);
        setSistemas(sistemasResultado);
      } catch (error) {
        if (!activo) return;

        console.error(
          'Error cargando procesos y sistemas:',
          error
        );

        setProcesos([]);
        setSistemas([]);
      } finally {
        if (activo) {
          setLoadingPadres(false);
        }
      }
    };

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  useEffect(() => {
    if (
      tipoPadre === 'proceso' &&
      procesoId
    ) {
      let activo = true;

      const cargar = async () => {
        setLoadingSubprocesos(true);

        try {
          const resultado =
            await getSubprocesos(
              Number(procesoId)
            );

          if (!activo) return;

          setSubprocesosProceso(
            resultado
          );
        } catch (error) {
          if (!activo) return;

          console.error(
            'Error cargando subprocesos de proceso:',
            error
          );

          setSubprocesosProceso([]);
        } finally {
          if (activo) {
            setLoadingSubprocesos(false);
          }
        }
      };

      cargar();

      return () => {
        activo = false;
      };
    }

    if (
      tipoPadre === 'sistema' &&
      sistemaId
    ) {
      let activo = true;

      const cargar = async () => {
        setLoadingSubprocesos(true);

        try {
          const resultado =
            await getSubprocesosSistema(
              Number(sistemaId)
            );

          if (!activo) return;

          setSubprocesosSistema(
            resultado
          );
        } catch (error) {
          if (!activo) return;

          console.error(
            'Error cargando subprocesos de sistema:',
            error
          );

          setSubprocesosSistema([]);
        } finally {
          if (activo) {
            setLoadingSubprocesos(false);
          }
        }
      };

      cargar();

      return () => {
        activo = false;
      };
    }
  }, [
    tipoPadre,
    procesoId,
    sistemaId,
  ]);

  const cambiarTipoPadre = (
    tipo: TipoPadre
  ) => {
    setTipoPadre(tipo);
    setProcesoId('');
    setSistemaId('');
    setSubprocesoId('');
    onSelectEquipo?.(null);
  };

  const cambiarProceso = (
    id: string
  ) => {
    setProcesoId(id);
    setSubprocesoId('');
    onSelectEquipo?.(null);
  };

  const cambiarSistema = (
    id: string
  ) => {
    setSistemaId(id);
    setSubprocesoId('');
    onSelectEquipo?.(null);
  };

  if (loadingPadres) {
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
            Seleccione el proceso o sistema,
            luego su subproceso padre.
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

              {procesos.map(
                (proceso) => (
                  <option
                    key={proceso.id}
                    value={proceso.id}
                  >
                    {proceso.nombre}
                  </option>
                )
              )}
            </select>
          </div>

          {procesoId && (
            <div className="planta-form">
              <label>
                Subproceso padre
              </label>

              <select
                value={subprocesoId}
                onChange={(e) => {
                  setSubprocesoId(
                    e.target.value
                  );
                  onSelectEquipo?.(null);
                }}
                disabled={
                  loadingSubprocesos
                }
              >
                <option value="">
                  {loadingSubprocesos
                    ? 'Cargando subprocesos...'
                    : 'Seleccione un subproceso'}
                </option>

                {subprocesosProceso.map(
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

          {subprocesoId && (
            <EquiposSubprocesoFinal
              key={`proceso-${subprocesoId}`}
              subprocesoId={
                Number(subprocesoId)
              }
              subprocesoNombre={
                subprocesosProceso.find(
                  (item) =>
                    item.id.toString() ===
                    subprocesoId
                )?.nombre || ''
              }
              onSelectEquipo={
                onSelectEquipo
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

              {sistemas.map(
                (sistema) => (
                  <option
                    key={sistema.id}
                    value={sistema.id}
                  >
                    {sistema.nombre}
                  </option>
                )
              )}
            </select>
          </div>

          {sistemaId && (
            <div className="planta-form">
              <label>
                Subproceso padre
              </label>

              <select
                value={subprocesoId}
                onChange={(e) => {
                  setSubprocesoId(
                    e.target.value
                  );
                  onSelectEquipo?.(null);
                }}
                disabled={
                  loadingSubprocesos
                }
              >
                <option value="">
                  {loadingSubprocesos
                    ? 'Cargando subprocesos...'
                    : 'Seleccione un subproceso'}
                </option>

                {subprocesosSistema.map(
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

          {subprocesoId && (
            <EquiposSubprocesoFinal
              key={`sistema-${subprocesoId}`}
              subprocesoId={
                Number(subprocesoId)
              }
              subprocesoNombre={
                subprocesosSistema.find(
                  (item) =>
                    item.id.toString() ===
                    subprocesoId
                )?.nombre || ''
              }
              onSelectEquipo={
                onSelectEquipo
              }
            />
          )}
        </>
      )}

    </section>
  );
}