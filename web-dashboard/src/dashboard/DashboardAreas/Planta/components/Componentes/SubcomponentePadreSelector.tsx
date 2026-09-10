import type {
  Subcomponente,
} from '../../services/plantaApi';

interface Props {
  subcomponentes: Subcomponente[];
  value: string;
  onChange: (value: string) => void;
}

export function SubcomponentePadreSelector({
  subcomponentes,
  value,
  onChange,
}: Props) {
  return (
    <div className="planta-form">
      <label>
        Subcomponente padre
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">
          Seleccione un subcomponente
        </option>

        {subcomponentes.map(
          (subcomponente) => (
            <option
              key={subcomponente.id}
              value={subcomponente.id}
            >
              {subcomponente.nombre}
            </option>
          )
        )}
      </select>
    </div>
  );
}