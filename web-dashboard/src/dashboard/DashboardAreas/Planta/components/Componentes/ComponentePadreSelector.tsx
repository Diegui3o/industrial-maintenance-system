import type {
  Componente,
} from '../../services/plantaApi';

interface Props {
  componentes: Componente[];
  value: string;
  onChange: (value: string) => void;
}

export function ComponentePadreSelector({
  componentes,
  value,
  onChange,
}: Props) {
  return (
    <div className="planta-form">
      <label>
        Componente padre
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">
          Seleccione un componente
        </option>

        {componentes.map(
          (componente) => (
            <option
              key={componente.id}
              value={componente.id}
            >
              {componente.nombre}
            </option>
          )
        )}
      </select>
    </div>
  );
}