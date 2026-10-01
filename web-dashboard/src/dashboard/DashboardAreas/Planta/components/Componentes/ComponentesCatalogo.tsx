interface Props {
  onCrear: () => void;
}

export function ComponentesCatalogo({
  onCrear,
}: Props) {
  return (
    <div className="componentes-catalogo">

      <div className="componentes-catalogo-toolbar">

        <div className="componentes-busqueda">
          <input
            type="text"
            placeholder="Buscar por SAP, TAG, nombre o equipo..."
          />
        </div>

        <select defaultValue="">
          <option value="">
            Todos los tipos
          </option>
          <option value="MOTOR ELECTRICO">
            Motor eléctrico
          </option>
          <option value="MODULO">
            Módulo
          </option>
          <option value="TABLERO">
            Tablero
          </option>
          <option value="COMPONENTE MECANICO">
            Componente mecánico
          </option>
          <option value="COMPONENTE INSTRUMENTAL">
            Componente instrumental
          </option>
          <option value="COMPONENTE SISTEMAS">
            Componente sistemas
          </option>
          <option value="ARRANCADOR">
            Arrancador
          </option>
          <option value="TANQUE">
            Tanque
          </option>
          <option value="ACONDICIONADOR">
            Acondicionador
          </option>
        </select>

        <select defaultValue="">
          <option value="">
            Todos los equipos
          </option>
        </select>

      </div>

      <div className="componentes-tabla">

        <div className="componentes-tabla-header">
          <span>Código SAP</span>
          <span>TAG</span>
          <span>Componente</span>
          <span>Tipo</span>
          <span>Equipo</span>
          <span>Estado</span>
          <span></span>
        </div>

        <div className="componentes-empty">

          <div className="componentes-empty-icon">
            ⚙
          </div>

          <strong>
            No hay componentes registrados
          </strong>

          <span>
            Los componentes registrados aparecerán
            aquí.
          </span>

          <button
            type="button"
            className="componentes-empty-btn"
            onClick={onCrear}
          >
            Crear primer componente
          </button>

        </div>

      </div>

    </div>
  );
}