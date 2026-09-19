import type { Componente } from '../../services/plantaApi';

interface Props {
  disponibles: Componente[];
  asignados: Componente[];
  seleccionado: Componente | null;
  busquedaDisponible: string;
  busquedaAsignado: string;
  loading: boolean;
  setSeleccionado: (
    componente: Componente
  ) => void;
  setBusquedaDisponible: (
    valor: string
  ) => void;
  setBusquedaAsignado: (
    valor: string
  ) => void;
  moverAAsignados: () => void;
  moverADisponibles: () => void;
}

function ComponenteItem({
  componente,
  seleccionado,
  setSeleccionado,
}: {
  componente: Componente;
  seleccionado: Componente | null;
  setSeleccionado: (
    componente: Componente
  ) => void;
}) {
  const activo =
    seleccionado?.id === componente.id;

  return (
    <button
      type="button"
      className={
        activo
          ? 'componentes-transfer-item selected'
          : 'componentes-transfer-item'
      }
      onClick={() =>
        setSeleccionado(componente)
      }
    >
      <span className="componentes-transfer-item-main">
        <strong>
          {componente.codigo
            ? `${componente.codigo} - `
            : ''}
          {componente.nombre}
        </strong>

        <small>
          {componente.descripcion ||
            'Sin descripción'}
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
              Componentes disponibles
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
              setBusquedaDisponible(
                e.target.value
              )
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
                Todos los componentes están asignados.
              </small>
            </div>
          ) : (
            disponibles.map((componente) => (
              <ComponenteItem
                key={componente.id}
                componente={componente}
                seleccionado={seleccionado}
                setSeleccionado={
                  setSeleccionado
                }
              />
            ))
          )}
        </div>
      </div>

      {/* BOTONES CENTRALES */}
      <div className="componentes-transfer-actions">
        <button
          type="button"
          className="componentes-transfer-action"
          onClick={moverAAsignados}
          disabled={!seleccionado}
          title="Asignar componente"
        >
          <span>→</span>
        </button>

        <button
          type="button"
          className="componentes-transfer-action"
          onClick={moverADisponibles}
          disabled={!seleccionado}
          title="Quitar componente"
        >
          <span>←</span>
        </button>

        <span className="componentes-transfer-hint">
          Seleccione un componente
          <br />
          para moverlo
        </span>
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
              setBusquedaAsignado(
                e.target.value
              )
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
                key={componente.id}
                componente={componente}
                seleccionado={seleccionado}
                setSeleccionado={
                  setSeleccionado
                }
              />
            ))
          )}
        </div>
      </div>

    </div>
  );
}