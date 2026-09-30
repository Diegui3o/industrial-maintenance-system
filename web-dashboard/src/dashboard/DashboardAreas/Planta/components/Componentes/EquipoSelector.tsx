import type { Equipo } from '../../services/plantaApi';

interface Props {
  equipos: Equipo[];
  equipoSeleccionado: Equipo | null;
  busquedaEquipo: string;
  loadingEquipos: boolean;
  setBusquedaEquipo: (valor: string) => void;
  setEquipoSeleccionado: (equipo: Equipo) => void;
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
      <div className="planta-parent-search">
        <label htmlFor="buscar-equipo-padre">
          Equipo padre
        </label>

        <div className="planta-parent-search-box">
          <span className="planta-parent-search-icon">
            ⌕
          </span>

          <input
            id="buscar-equipo-padre"
            type="search"
            value={busquedaEquipo}
            onChange={(e) =>
              setBusquedaEquipo(e.target.value)
            }
            placeholder="Buscar por código o nombre..."
          />

          {busquedaEquipo && (
            <button
              type="button"
              className="planta-parent-search-clear"
              onClick={() => setBusquedaEquipo('')}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {!loadingEquipos && (
        <div className="planta-parent-results">
          <span>
            {equipos.length}{' '}
            {equipos.length === 1
              ? 'equipo encontrado'
              : 'equipos encontrados'}
          </span>
        </div>
      )}

      {loadingEquipos && (
        <div className="planta-empty">
          Cargando equipos...
        </div>
      )}

      {!loadingEquipos && equipos.length === 0 && (
        <div className="planta-empty">
          <strong>No se encontraron equipos</strong>
          <span>
            Pruebe con otro código o nombre.
          </span>
        </div>
      )}

      {!loadingEquipos && equipos.length > 0 && (
        <div className="planta-parent-list">
          {equipos.map((equipo) => {
            const seleccionado =
              equipoSeleccionado?.id === equipo.id;

            return (
              <button
                type="button"
                key={equipo.id}
                className={
                  seleccionado
                    ? 'planta-parent-item selected'
                    : 'planta-parent-item'
                }
                onClick={() =>
                  setEquipoSeleccionado(equipo)
                }
              >
                <div className="planta-parent-item-main">
                  <span className="planta-parent-item-code">
                    {equipo.codigo || 'SIN CÓDIGO'}
                  </span>

                  <strong className="planta-parent-item-name">
                    {equipo.nombre}
                  </strong>
                </div>

                <div className="planta-parent-item-meta">
                  <span>
                    <b>Área</b>
                    {equipo.area || 'Sin área'}
                  </span>

                  <span>
                    <b>Estado</b>
                    {equipo.estado_equipo || 'Sin estado'}
                  </span>
                </div>

                {seleccionado && (
                  <span className="planta-parent-item-check">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}