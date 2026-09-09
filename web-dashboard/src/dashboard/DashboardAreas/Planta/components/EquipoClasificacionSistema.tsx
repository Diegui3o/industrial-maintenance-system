import { useEffect, useState } from 'react';
import {
  asignarClasificacionesEquipo,
  asignarSistemasEquipo,
  getClasificaciones,
  getClasificacionesEquipo,
  getSistemas,
  getSistemasEquipo,
  type ClasificacionPlanta,
  type Equipo,
  type SistemaPlanta,
} from '../services/plantaApi';

interface Props {
  equipo: Equipo;
}

export function EquipoClasificacionSistema({
  equipo,
}: Props) {
  const [clasificaciones, setClasificaciones] =
    useState<ClasificacionPlanta[]>([]);

  const [sistemas, setSistemas] =
    useState<SistemaPlanta[]>([]);

  const [seleccionClasificaciones, setSeleccionClasificaciones] =
    useState<number[]>([]);

  const [seleccionSistemas, setSeleccionSistemas] =
    useState<number[]>([]);

  const [guardandoClasificaciones, setGuardandoClasificaciones] =
    useState(false);

  const [guardandoSistemas, setGuardandoSistemas] =
    useState(false);

  const cargar = async () => {
    try {
      const [
        todasClasificaciones,
        todasSistemas,
        equipoClasificaciones,
        equipoSistemas,
      ] = await Promise.all([
        getClasificaciones(),
        getSistemas(),
        getClasificacionesEquipo(equipo.id),
        getSistemasEquipo(equipo.id),
      ]);

      setClasificaciones(todasClasificaciones);
      setSistemas(todasSistemas);

      setSeleccionClasificaciones(
        equipoClasificaciones.map((item) => item.id)
      );

      setSeleccionSistemas(
        equipoSistemas.map((item) => item.id)
      );
    } catch (error) {
      console.error(
        'Error cargando clasificación y sistemas:',
        error
      );
    }
  };

  useEffect(() => {
    cargar();
  }, [equipo.id]);

  const cambiarClasificacion = (id: number) => {
    setSeleccionClasificaciones((actual) =>
      actual.includes(id)
        ? actual.filter((item) => item !== id)
        : [...actual, id]
    );
  };

  const cambiarSistema = (id: number) => {
    setSeleccionSistemas((actual) =>
      actual.includes(id)
        ? actual.filter((item) => item !== id)
        : [...actual, id]
    );
  };

  const guardarClasificaciones = async () => {
    if (guardandoClasificaciones) return;

    setGuardandoClasificaciones(true);

    try {
      await asignarClasificacionesEquipo(
        equipo.id,
        seleccionClasificaciones
      );

      alert('Clasificaciones actualizadas.');
    } catch (error) {
      console.error(error);
      alert(
        'No se pudieron actualizar las clasificaciones.'
      );
    } finally {
      setGuardandoClasificaciones(false);
    }
  };

  const guardarSistemas = async () => {
    if (guardandoSistemas) return;

    setGuardandoSistemas(true);

    try {
      await asignarSistemasEquipo(
        equipo.id,
        seleccionSistemas
      );

      alert('Sistemas actualizados.');
    } catch (error) {
      console.error(error);
      alert(
        'No se pudieron actualizar los sistemas.'
      );
    } finally {
      setGuardandoSistemas(false);
    }
  };

  return (
    <section className="planta-card">

      <div className="planta-card-header">
        <div>
          <h3>Clasificación y sistemas</h3>

          <p>
            {equipo.codigo} — {equipo.nombre}
          </p>
        </div>
      </div>

      <div className="planta-dual-grid">

        <div>
          <h4>Clasificaciones</h4>

          {clasificaciones.length === 0 ? (
            <div className="planta-empty">
              No hay clasificaciones disponibles.
            </div>
          ) : (
            <div className="planta-check-list">
              {clasificaciones.map((item) => (
                <label
                  key={item.id}
                  className="planta-check-item"
                >
                  <input
                    type="checkbox"
                    checked={seleccionClasificaciones.includes(
                      item.id
                    )}
                    onChange={() =>
                      cambiarClasificacion(item.id)
                    }
                  />

                  <span>
                    <strong>{item.nombre}</strong>

                    {item.descripcion && (
                      <small>
                        {item.descripcion}
                      </small>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}

          <button
            className="planta-save-btn"
            onClick={guardarClasificaciones}
            disabled={guardandoClasificaciones}
          >
            {guardandoClasificaciones
              ? 'Guardando...'
              : 'Guardar clasificaciones'}
          </button>
        </div>

        <div>
          <h4>Sistemas</h4>

          {sistemas.length === 0 ? (
            <div className="planta-empty">
              No hay sistemas disponibles.
            </div>
          ) : (
            <div className="planta-check-list">
              {sistemas.map((item) => (
                <label
                  key={item.id}
                  className="planta-check-item"
                >
                  <input
                    type="checkbox"
                    checked={seleccionSistemas.includes(
                      item.id
                    )}
                    onChange={() =>
                      cambiarSistema(item.id)
                    }
                  />

                  <span>
                    <strong>{item.nombre}</strong>

                    {item.descripcion && (
                      <small>
                        {item.descripcion}
                      </small>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}

          <button
            className="planta-save-btn"
            onClick={guardarSistemas}
            disabled={guardandoSistemas}
          >
            {guardandoSistemas
              ? 'Guardando...'
              : 'Guardar sistemas'}
          </button>
        </div>

      </div>
    </section>
  );
}