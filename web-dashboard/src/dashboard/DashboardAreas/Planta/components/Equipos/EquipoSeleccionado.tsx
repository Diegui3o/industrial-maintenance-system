import type {
  Equipo,
} from '../../services/plantaApi';

interface Props {
  equipo: Equipo | null;
  onClear: () => void;
}

export function EquipoSeleccionado({
  equipo,
  onClear,
}: Props) {
  if (!equipo) {
    return (
      <div className="planta-alert warning">
        <strong>
          Equipo no seleccionado
        </strong>

        <span>
          Seleccione un equipo para continuar
          con componentes y subcomponentes.
        </span>
      </div>
    );
  }

  return (
    <div className="planta-list">
      <div className="planta-list-item">
        <div className="planta-list-main">
          <div>
            <strong>
              {equipo.nombre}
            </strong>
          </div>
        </div>

        <button
          type="button"
          className="planta-edit-btn"
          onClick={onClear}
        >
          ×
        </button>
      </div>
    </div>
  );
}