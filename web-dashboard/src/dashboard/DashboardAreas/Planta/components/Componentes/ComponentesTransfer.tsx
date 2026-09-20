import type { Componente } from '../../services/plantaApi';

interface Props {
  disponibles: Componente[];
  asignados: Componente[];
  seleccionado: Componente | null;
  origenSeleccionado: 'disponible' | 'asignado' | null;
  busquedaDisponible: string;
  busquedaAsignado: string;
  loading: boolean;
  setSeleccionado: (
    componente: Componente,
    origen: 'disponible' | 'asignado'
  ) => void;
  setBusquedaDisponible: (valor: string) => void;
  setBusquedaAsignado: (valor: string) => void;
  moverAAsignados: () => void;
  moverADisponibles: () => void;
}

function ComponenteItem({
  componente,
  seleccionado,
  origen,
  origenSeleccionado,
  setSeleccionado,
}: {
  componente: Componente;
  seleccionado: Componente | null;
  origen: 'disponible' | 'asignado';
  origenSeleccionado: 'disponible' | 'asignado' | null;
  setSeleccionado: (
    componente: Componente,
    origen: 'disponible' | 'asignado'
  ) => void;
}) {
  const activo =
    seleccionado?.id === componente.id &&
    origenSeleccionado === origen;

  return (
    <button
      type="button"
      className={
        activo
          ? 'componentes-transfer-item selected'
          : 'componentes-transfer-item'
      }
      onClick={() => setSeleccionado(componente, origen)}
    >
      <span className="componentes-transfer-item-main">
        <strong>
          {componente.codigo
            ? `${componente.codigo} - `
            : ''}
          {componente.nombre}
        </strong>

        <small>
          {componente.descripcion || 'Sin descripción'}
        </small>
      </span>

      <span className="componentes-transfer-item-indicator">
        {activo ? '✓' : '›'}
      </span>
    </button>
  );
}

export function ComponentesTransfer({
  disponibles,
  asignados,
  seleccionado,
  origenSeleccionado,
  busquedaDisponible,
  busquedaAsignado,
  loading,
  setSeleccionado,
  setBusquedaDisponible,
  setBusquedaAsignado,
  moverAAsignados,
  moverADisponibles,
}: Props) {
  return (
    <div className="componentes-transfer">

      {/* DISPONIBLES */}
      <div className="componentes-transfer-panel">
        <div className="componentes-transfer-panel-header">
          <div>
            <span className="componentes-transfer-label">
              DISPONIBLES
            </span>

            <strong>
              Componentes de otros equipos
            </strong>
          </div>

          <span className="componentes-transfer-count">
            {disponibles.length}
          </span>
        </div>

        <div className="componentes-transfer-search">
          <span>⌕</span>

          <input
            type="search"
            value={busquedaDisponible}
            onChange={(e) =>
              setBusquedaDisponible(e.target.value)
            }
            placeholder="Buscar componente..."
          />
        </div>

        <div className="componentes-transfer-list">
          {loading ? (
            <div className="componentes-transfer-empty">
              <span>⟳</span>
              <p>Cargando componentes...</p>
            </div>
          ) : disponibles.length === 0 ? (
            <div className="componentes-transfer-empty">
              <span>✓</span>

              <p>
                No hay componentes disponibles
              </p>

              <small>
                Todos los componentes ya pertenecen a este equipo.
              </small>
            </div>
          ) : (
            disponibles.map((componente) => (
              <ComponenteItem
                key={`disponible-${componente.id}`}
                componente={componente}
                origen="disponible"
                seleccionado={seleccionado}
                origenSeleccionado={origenSeleccionado}
                setSeleccionado={setSeleccionado}
              />
            ))
          )}
        </div>
      </div>

      {/* ACCIÓN */}
      <div className="componentes-transfer-actions">
        <button
          type="button"
          className="componentes-transfer-action"
          onClick={moverAAsignados}
          disabled={
            !seleccionado ||
            origenSeleccionado !== 'disponible'
          }
          title="Asignar componente al equipo"
        >
          →
        </button>

        <button
          type="button"
          className="componentes-transfer-action"
          onClick={moverADisponibles}
          disabled={
            !seleccionado ||
            origenSeleccionado !== 'asignado'
          }
          title="Devolver a disponibles"
        >
          ←
        </button>
      </div>

      {/* ASIGNADOS */}
      <div className="componentes-transfer-panel">
        <div className="componentes-transfer-panel-header">
          <div>
            <span className="componentes-transfer-label">
              ASIGNADOS
            </span>

            <strong>
              Componentes del equipo
            </strong>
          </div>

          <span className="componentes-transfer-count assigned">
            {asignados.length}
          </span>
        </div>

        <div className="componentes-transfer-search">
          <span>⌕</span>

          <input
            type="search"
            value={busquedaAsignado}
            onChange={(e) =>
              setBusquedaAsignado(e.target.value)
            }
            placeholder="Buscar asignado..."
          />
        </div>

        <div className="componentes-transfer-list">
          {loading ? (
            <div className="componentes-transfer-empty">
              <span>⟳</span>
              <p>Cargando componentes...</p>
            </div>
          ) : asignados.length === 0 ? (
            <div className="componentes-transfer-empty">
              <span>+</span>

              <p>
                No hay componentes asignados
              </p>

              <small>
                Seleccione uno de la lista izquierda.
              </small>
            </div>
          ) : (
            asignados.map((componente) => (
              <ComponenteItem
                key={`asignado-${componente.id}`}
                componente={componente}
                origen="asignado"
                seleccionado={seleccionado}
                origenSeleccionado={origenSeleccionado}
                setSeleccionado={setSeleccionado}
              />
            ))
          )}
        </div>
      </div>

    </div>
  );
}