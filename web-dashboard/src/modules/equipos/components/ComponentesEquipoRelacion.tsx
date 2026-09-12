import { useEffect, useState } from 'react';

import {
  getComponentes,
  getComponentesParaRelacionEquipo,
  relacionarComponentesConEquipo,
  type Componente,
} from '../../../dashboard/DashboardAreas/Planta/services/plantaApi';

interface Props {
  equipoId: number | null;
}

export function ComponentesEquipoRelacion({
  equipoId,
}: Props) {
    const [componentes, setComponentes] =
    useState<Componente[]>([]);

  const [seleccionados, setSeleccionados] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState('');

  useEffect(() => {
    if (!equipoId) {
      setComponentes([]);
      setSeleccionados([]);
      return;
    }

    let cancelado = false;

    const cargar = async () => {
      setLoading(true);
      setMensaje('');

      try {
        const [
          todos,
          relacionados,
        ] = await Promise.all([
          getComponentesParaRelacionEquipo(
            equipoId
          ),
          getComponentes(equipoId),
        ]);

        if (cancelado) {
          return;
        }

        setComponentes(todos);

        setSeleccionados(
          relacionados.map(
            (item) => item.id
          )
        );
      } catch (error) {
        console.error(
          'Error cargando componentes:',
          error
        );

        if (!cancelado) {
          setComponentes([]);
          setSeleccionados([]);
          setMensaje(
            'No se pudieron cargar los componentes.'
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
  }, [equipoId]);

  const cambiarSeleccion = (
    componenteId: number
  ) => {
    setSeleccionados((actuales) =>
      actuales.includes(componenteId)
        ? actuales.filter(
            (id) => id !== componenteId
          )
        : [...actuales, componenteId]
    );
  };

  const guardar = async () => {
    if (!equipoId) {
      return;
    }

    if (seleccionados.length === 0) {
      setMensaje(
        'Seleccione al menos un componente.'
      );
      return;
    }

    setGuardando(true);
    setMensaje('');

    try {
      await relacionarComponentesConEquipo(
        equipoId,
        seleccionados
      );

      setMensaje(
        'Relación guardada correctamente.'
      );
    } catch (error) {
      console.error(
        'Error guardando componentes:',
        error
      );

      setMensaje(
        'No se pudo guardar la relación.'
      );
    } finally {
      setGuardando(false);
    }
  };

  if (!equipoId) {
    return (
      <div className="planta-empty">
        Seleccione un equipo para administrar
        sus componentes.
      </div>
    );
  }

  return (
    <section className="planta-card">
      <div className="planta-card-header">
        <div>
          <h3>Componentes</h3>

          <p>
            Seleccione uno o varios componentes
            para relacionarlos con el equipo.
          </p>
        </div>
      </div>

      {loading && (
        <div className="planta-empty">
          Cargando componentes...
        </div>
      )}

      {!loading && (
        <>
          <div className="planta-list">
            {componentes.map((componente) => (
              <label
                key={componente.id}
                className="planta-list-item"
              >
                <input
                  type="checkbox"
                  checked={seleccionados.includes(
                    componente.id
                  )}
                  onChange={() =>
                    cambiarSeleccion(
                      componente.id
                    )
                  }
                />

                <div className="planta-list-main">
                  <div>
                    <strong>
                      {componente.nombre}
                    </strong>

                    {componente.codigo && (
                      <small>
                        Código:{' '}
                        {componente.codigo}
                      </small>
                    )}

                    {componente.descripcion && (
                      <small>
                        {
                          componente.descripcion
                        }
                      </small>
                    )}

                    <small>
                      {seleccionados.includes(
                        componente.id
                      )
                        ? 'Relacionado'
                        : 'Disponible'}
                    </small>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {componentes.length === 0 && (
            <div className="planta-empty">
              No hay componentes registrados.
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