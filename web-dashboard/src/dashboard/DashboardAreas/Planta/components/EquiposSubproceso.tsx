import { useEffect, useState } from 'react';
import {
  asignarEquipoSubproceso,
  getEquiposPorSubproceso,
  type Equipo,
  type Subproceso,
} from '../services/plantaApi';
import { getEquipos } from '../services/equiposApi';

interface Props {
  subproceso: Subproceso | null;
}

export function EquiposSubproceso({ subproceso }: Props) {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [disponibles, setDisponibles] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarDisponibles, setMostrarDisponibles] = useState(false);

  const cargar = async () => {
    if (!subproceso) return;

    setLoading(true);

    try {
      const [asignados, todos] = await Promise.all([
        getEquiposPorSubproceso(subproceso.id),
        getEquipos(),
      ]);

      setEquipos(asignados);

      const idsAsignados = new Set(
        asignados.map((equipo) => equipo.id)
      );

      setDisponibles(
        todos.filter((equipo) => !idsAsignados.has(equipo.id))
      );
    } catch (error) {
      console.error('Error cargando equipos:', error);
      setEquipos([]);
      setDisponibles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEquipos([]);
    setDisponibles([]);
    setMostrarDisponibles(false);

    if (subproceso) {
      cargar();
    }
  }, [subproceso]);

  const asignar = async (equipoId: number) => {
    if (!subproceso || guardando) return;

    setGuardando(true);

    try {
      await asignarEquipoSubproceso(
        equipoId,
        subproceso.id
      );

      await cargar();
    } catch (error) {
      console.error('Error asignando equipo:', error);
      alert('No se pudo asignar el equipo.');
    } finally {
      setGuardando(false);
    }
  };

  if (!subproceso) {
    return null;
  }

  return (
    <section className="planta-card planta-equipos-card">
      <div className="planta-card-header">
        <div>
          <h3>Equipos</h3>
          <p>{subproceso.nombre}</p>
        </div>

        <button
          className="planta-add-btn"
          onClick={() =>
            setMostrarDisponibles(!mostrarDisponibles)
          }
        >
          {mostrarDisponibles ? 'Cerrar' : '+ Asignar equipo'}
        </button>
      </div>

      {mostrarDisponibles && (
        <div className="planta-form planta-equipos-disponibles">
          <strong>Equipos disponibles</strong>

          {disponibles.length === 0 && (
            <div className="planta-empty">
              No hay equipos disponibles.
            </div>
          )}

          {disponibles.map((equipo) => (
            <div
              key={equipo.id}
              className="planta-equipo-disponible"
            >
              <div>
                <strong>{equipo.codigo}</strong>
                <small>{equipo.nombre}</small>
              </div>

              <button
                className="planta-save-btn"
                onClick={() => asignar(equipo.id)}
                disabled={guardando}
              >
                Asignar
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="planta-list">
        {loading && (
          <div className="planta-empty">
            Cargando equipos...
          </div>
        )}

        {!loading && equipos.length === 0 && (
          <div className="planta-empty">
            No hay equipos asignados a este subproceso.
          </div>
        )}

        {!loading &&
          equipos.map((equipo) => (
            <div
              key={equipo.id}
              className="planta-list-item"
            >
              <div>
                <strong>
                  {equipo.codigo} — {equipo.nombre}
                </strong>

                <small>
                  {equipo.tipo || 'Sin tipo'}
                  {equipo.fabricante
                    ? ` · ${equipo.fabricante}`
                    : ''}
                  {equipo.modelo
                    ? ` · ${equipo.modelo}`
                    : ''}
                </small>
              </div>

              <span>
                {equipo.estado_equipo || 'Sin estado'}
              </span>
            </div>
          ))}
      </div>
    </section>
  );
}