import type {
  SistemaPlanta,
} from '../../services/plantaApi';

interface Props {
  sistemas: SistemaPlanta[];
  sistemaId: string;
  onChange: (sistemaId: string) => void;
}

export function SubprocesoSistemaSelector({
  sistemas,
  sistemaId,
  onChange,
}: Props) {
  return (
    <div className="planta-form">
      <label>
        Sistema padre
      </label>

      <select
        value={sistemaId}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">
          Seleccione un sistema
        </option>

        {sistemas.map((sistema) => (
          <option
            key={sistema.id}
            value={sistema.id}
          >
            {sistema.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}