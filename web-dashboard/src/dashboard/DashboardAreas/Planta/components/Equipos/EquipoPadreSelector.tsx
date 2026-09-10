import type {
  Subproceso,
} from '../../services/plantaApi';

interface Props {
  subprocesos: Subproceso[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function EquipoPadreSelector({
  subprocesos,
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <div className="planta-form">
      <label>
        Subproceso padre
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">
          Seleccione un subproceso
        </option>

        {subprocesos.map((subproceso) => (
          <option
            key={subproceso.id}
            value={subproceso.id}
          >
            {subproceso.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}