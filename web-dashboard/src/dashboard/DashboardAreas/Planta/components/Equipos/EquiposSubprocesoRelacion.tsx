import { useEffect, useState } from 'react';

import {
  getEquiposParaRelacionSubproceso,
  getEquiposPorSubproceso,
  relacionarEquiposConSubproceso,
  type Equipo,
} from '../../services/plantaApi';

interface Props {
  subprocesoId: number | null;
}

export function EquiposSubprocesoRelacion({
  subprocesoId,
}: Props) {
  const [equipos, setEquipos] =
    useState<Equipo[]>([]);

  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  useEffect(() => {
    if (!subprocesoId) {
      return;
    }

    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setMensaje('');

      try {
        const [
          todosLosEquipos,
          equiposRelacionados,
        ] = await Promise.all([
          getEquiposParaRelacionSubproceso(
            subprocesoId
          ),
          getEquiposPorSubproceso(
            subprocesoId
          ),
        ]);

        if (cancelado) {
          return;
        }

        setEquipos(todosLosEquipos);

        setSeleccionados(
          equiposRelacionados.map(
            (equipo) => equipo.id
          )
        );
      } catch (error) {
        console.error(
          'Error cargando equipos:',
          error
        );

        if (!cancelado) {
          setEquipos([]);
          setSeleccionados([]);
          setMensaje(
            'No se pudieron cargar los equipos.'
          );
        }
      } finally {
        if (!cancelado) {
          setLoading(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [subprocesoId]);

  const cambiarSeleccion = (
    equipoId: number
  ) => {
    setSeleccionados((actuales) =>
      actuales.includes(equipoId)
        ? actuales.filter(
            (id) => id !== equipoId
          )
        : [...actuales, equipoId]
    );
  };

  const guardar = async () => {
    if (!subprocesoId) {
      return;
    }

    if (seleccionados.length === 0) {
      setMensaje(
        'Seleccione al menos un equipo.'
      );
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await relacionarEquiposConSubproceso(
        subprocesoId,
        seleccionados
      );

      setMensaje(
        'Relación guardada correctamente.'
      );
    } catch (error) {
      console.error(
        'Error guardando equipos:',
        error
      );

      setMensaje(
        'No se pudo guardar la relación.'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!subprocesoId) {
    return (
      <div className="planta-empty">
        Seleccione un subproceso para administrar
        sus equipos.
      </div>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Equipos</h3>

          <p>
            Seleccione uno o varios equipos para
            relacionarlos con el subproceso.
          </p>
        </div>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando equipos...
        </div>
      )}

      {!loading && (
        <>
          <div className="planta-list">
            {equipos.map((equipo) => (
              <label
                key={equipo.id}
                className="planta-list-item"
              >
                <input
                  type="checkbox"
                  checked={seleccionados.includes(
                    equipo.id
                  )}
                  onChange={() =>
                    cambiarSeleccion(
                      equipo.id
                    )
                  }
                />

                <div className="planta-list-main">
                  <div>
                    <strong>
                      {equipo.nombre}
                    </strong>

                    {equipo.codigo && (
                      <small>
                        Código: {equipo.codigo}
                      </small>
                    )}

                    {equipo.area && (
                      <small>
                        Área: {equipo.area}
                      </small>
                    )}

                    {equipo.tipo && (
                      <small>
                        Tipo: {equipo.tipo}
                      </small>
                    )}

                    <small>
                      {seleccionados.includes(
                        equipo.id
                      )
                        ? 'Relacionado'
                        : 'Disponible'}
                    </small>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {equipos.length === 0 && (
            <div className="planta-empty">
              No hay equipos registrados.
            </div>
          )}

          <div className="planta-form-actions">
            <button
              type="button"
              className="planta-save-btn"
              onClick={guardar}
              disabled={guardando}
            >
              {guardando
                ? 'Guardando...'
                : 'Guardar relación'}
            </button>
          </div>
        </>
      )}

      {mensaje && (
        <div className="planta-alert">
          {mensaje}
        </div>
      )}
    </section>
  );
}