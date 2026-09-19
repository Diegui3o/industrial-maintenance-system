import type { Equipo } from '../../services/plantaApi';

interface Props {
  equipos: Equipo[];
  equipoSeleccionado: Equipo | null;
  busquedaEquipo: string;
  loadingEquipos: boolean;
  setBusquedaEquipo: (valor: string) => void;
  setEquipoSeleccionado: (
    equipo: Equipo
  ) => void;
}

export function EquipoSelector({
  equipos,
  equipoSeleccionado,
  busquedaEquipo,
  loadingEquipos,
  setBusquedaEquipo,
  setEquipoSeleccionado,
}: Props) {
  return (
    <div className="planta-parent-selector">
      <div>
        <label>Equipo padre</label>

        <input
          type="search"
          value={busquedaEquipo}
          onChange={(e) =>
            setBusquedaEquipo(
              e.target.value
            )
          }
          placeholder="Buscar equipo..."
        />
      </div>

      {loadingEquipos && (
        <div className="planta-empty">
          Cargando equipos...
        </div>
      )}

      {!loadingEquipos &&
        equipos.length === 0 && (
          <div className="planta-empty">
            No existen equipos para este
            subproceso.
          </div>
        )}

      {!loadingEquipos &&
        equipos.length > 0 && (
          <div className="planta-parent-list">
            {equipos.map((equipo) => (
              <button
                type="button"
                key={equipo.id}
                className={
                  equipoSeleccionado?.id ===
                  equipo.id
                    ? 'planta-parent-item selected'
                    : 'planta-parent-item'
                }
                onClick={() =>
                  setEquipoSeleccionado(
                    equipo
                  )
                }
              >
                <strong>
                  {equipo.codigo
                    ? `${equipo.codigo} - `
                    : ''}
                  {equipo.nombre}
                </strong>

                <small>
                  Área:{' '}
                  {equipo.area ||
                    'Sin área'}
                </small>

                <small>
                  Estado:{' '}
                  {equipo.estado_equipo ||
                    'Sin estado'}
                </small>
              </button>
            ))}
          </div>
        )}
    </div>
  );
}