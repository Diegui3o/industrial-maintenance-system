import { useEffect, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  getSubprocesos,
  getEquiposPorSubproceso,
  type Proceso,
  type SistemaPlanta,
  type Subproceso,
  type Equipo,
} from '../../services/plantaApi';

interface Props {
  onSelectEquipo: (
    equipo: Equipo | null
  ) => void;
}

type TipoPadre =
  | 'proceso'
  | 'sistema'
  | '';

export function EquiposEstructuraCompleta({
  onSelectEquipo,
}: Props) {
  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([]);

  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [tipoPadre, setTipoPadre] =
    useState<TipoPadre>('');

  const [procesoId, setProcesoId] =
    useState('');

  const [sistemaId, setSistemaId] =
    useState('');

  const [subprocesoId, setSubprocesoId] =
    useState('');

  const [equipoId, setEquipoId] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const cargar = async () => {
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
          'Error cargando procesos y sistemas:',
          error
        );
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  const cambiarTipoPadre = (
    tipo: TipoPadre
  ) => {
    setTipoPadre(tipo);
    setProcesoId('');
    setSistemaId('');
    setSubprocesoId('');
    setEquipoId('');
    setSubprocesos([]);
    setEquipos([]);
    onSelectEquipo(null);
  };

  const cambiarProceso = async (
    id: string
  ) => {
    setProcesoId(id);
    setSubprocesoId('');
    setEquipoId('');
    setEquipos([]);
    onSelectEquipo(null);

    if (!id) {
      setSubprocesos([]);
      return;
    }

    try {
      const resultado =
        await getSubprocesos(
          Number(id)
        );

      setSubprocesos(resultado);
    } catch (error) {
      console.error(
        'Error cargando subprocesos:',
        error
      );

      setSubprocesos([]);
    }
  };

  const cambiarSubproceso = async (
    id: string
  ) => {
    setSubprocesoId(id);
    setEquipoId('');
    onSelectEquipo(null);

    if (!id) {
      setEquipos([]);
      return;
    }

    try {
      const resultado =
        await getEquiposPorSubproceso(
          Number(id)
        );

      setEquipos(resultado);
    } catch (error) {
      console.error(
        'Error cargando equipos:',
        error
      );

      setEquipos([]);
    }
  };

  const seleccionarEquipo = (
    id: string
  ) => {
    setEquipoId(id);

    const seleccionado =
      equipos.find(
        (equipo) =>
          equipo.id.toString() === id
      ) || null;

    onSelectEquipo(seleccionado);
  };

  if (loading) {
    return (
      <section className="planta-card">
        <div className="planta-empty">
          Cargando estructura...
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
            Seleccione la estructura padre
            hasta llegar al equipo.
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

          {procesoId && (
            <div className="planta-form">
              <label>
                Subproceso padre
              </label>

              <select
                value={subprocesoId}
                onChange={(e) =>
                  cambiarSubproceso(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccione un subproceso
                </option>

                {subprocesos.map(
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
      )}

      {tipoPadre === 'sistema' && (
        <>
          <div className="planta-form">
            <label>
              Sistema padre
            </label>

            <select
              value={sistemaId}
              onChange={(e) => {
                setSistemaId(
                  e.target.value
                );
                setSubprocesoId('');
                setEquipoId('');
                setSubprocesos([]);
                setEquipos([]);
                onSelectEquipo(null);
              }}
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

          <div className="planta-alert warning">
            <strong>
              Equipos de sistema
            </strong>

            <span>
              La asociación de equipos a
              subprocesos de sistema se mantiene
              mediante el componente existente.
            </span>
          </div>
        </>
      )}

      {equipos.length > 0 && (
        <div className="planta-form">
          <label>
            Equipo
          </label>

          <select
            value={equipoId}
            onChange={(e) =>
              seleccionarEquipo(
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
      )}

      {subprocesoId &&
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

    </section>
  );
}