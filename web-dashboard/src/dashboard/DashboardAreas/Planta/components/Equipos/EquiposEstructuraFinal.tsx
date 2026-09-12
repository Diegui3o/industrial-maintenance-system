import { useCallback, useEffect, useState } from 'react';

import {
  getProcesos,
  getSistemas,
  getTodosSubprocesos,
  getTodosSubprocesosSistema,
  type Proceso,
  type SistemaPlanta,
  type Subproceso,
  type SubprocesoSistemaPlanta,
} from '../../services/plantaApi';

import { EquiposSubproceso } from './EquiposSubproceso';

type TipoEstructura =
  | 'proceso'
  | 'sistema'
  | '';

interface Props {
  onSelectEquipo?: (equipo: null) => void;
}

export function EquiposEstructuraFinal({
  onSelectEquipo,
}: Props) {
  const [tipo, setTipo] =
    useState<TipoEstructura>('');

  const [procesos, setProcesos] =
    useState<Proceso[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [subprocesos, setSubprocesos] =
    useState<Subproceso[]>([]);

  const [
    subprocesosSistema,
    setSubprocesosSistema,
  ] = useState<SubprocesoSistemaPlanta[]>([]);

  const [procesoId, setProcesoId] =
    useState<number | null>(null);

  const [sistemaId, setSistemaId] =
    useState<number | null>(null);

  const [subprocesoId, setSubprocesoId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const cargarDatos = useCallback(
    async () => {
      setLoading(true);

      try {
        const [
          procesosResultado,
          sistemasResultado,
          subprocesosResultado,
          subprocesosSistemaResultado,
        ] = await Promise.all([
          getProcesos(),
          getSistemas(),
          getTodosSubprocesos(),
          getTodosSubprocesosSistema(),
        ]);

        setProcesos(procesosResultado);
        setSistemas(sistemasResultado);
        setSubprocesos(
          subprocesosResultado
        );
        setSubprocesosSistema(
          subprocesosSistemaResultado
        );
      } catch (error) {
        console.error(
          'Error cargando estructura de equipos:',
          error
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const cambiarTipo = (
    nuevoTipo: TipoEstructura
  ) => {
    setTipo(nuevoTipo);
    setProcesoId(null);
    setSistemaId(null);
    setSubprocesoId(null);

    onSelectEquipo?.(null);
  };

  const cambiarProceso = (valor: string) => {
    const id = valor
      ? Number(valor)
      : null;

    setProcesoId(id);
    setSubprocesoId(null);

    onSelectEquipo?.(null);
  };

  const cambiarSistema = (valor: string) => {
    const id = valor
      ? Number(valor)
      : null;

    setSistemaId(id);
    setSubprocesoId(null);

    onSelectEquipo?.(null);
  };

  const cambiarSubproceso = (
    valor: string
  ) => {
    const id = valor
      ? Number(valor)
      : null;

    setSubprocesoId(id);

    onSelectEquipo?.(null);
  };

  const subprocesosDisponibles =
    tipo === 'proceso'
      ? subprocesos.filter(
          (item) =>
            item.proceso_id === procesoId
        )
      : subprocesosSistema.filter(
          (item) =>
            item.sistema_id === sistemaId
        );

  const subprocesoSeleccionado =
    tipo === 'proceso'
      ? subprocesos.find(
          (item) =>
            item.id === subprocesoId
        )
      : subprocesosSistema.find(
          (item) =>
            item.id === subprocesoId
        );

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
          value={tipo}
          onChange={(e) =>
            cambiarTipo(
              e.target.value as TipoEstructura
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

      {tipo === 'proceso' && (
        <>
          <div className="planta-form">
            <label>
              Proceso padre
            </label>

            <select
              value={procesoId ?? ''}
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
        </>
      )}

      {tipo === 'sistema' && (
        <div className="planta-form">
          <label>
            Sistema padre
          </label>

          <select
            value={sistemaId ?? ''}
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
      )}

      {(procesoId || sistemaId) && (
        <div className="planta-form">
          <label>
            Subproceso padre
          </label>

          <select
            value={subprocesoId ?? ''}
            onChange={(e) =>
              cambiarSubproceso(
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

      {loading && (
        <div className="planta-empty">
          Cargando estructura...
        </div>
      )}

      {!loading &&
        subprocesoSeleccionado && (
          <EquiposSubproceso
            subprocesoId={
              subprocesoSeleccionado.id
            }
            subprocesoNombre={
              subprocesoSeleccionado.nombre
            }
          />
        )}

      {!loading &&
        (procesoId || sistemaId) &&
        subprocesosDisponibles.length === 0 && (
          <div className="planta-empty">
            No existen subprocesos asociados
            al elemento seleccionado.
          </div>
        )}
    </section>
  );
}