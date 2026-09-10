import type {
  Proceso,
} from '../../services/plantaApi';

interface Props {
  procesos: Proceso[];
  procesoId: string;
  onChange: (procesoId: string) => void;
}

export function SubprocesoProcesoSelector({
  procesos,
  procesoId,
  onChange,
}: Props) {
  return (
    <div className="planta-form">
      <label>
        Proceso padre
      </label>

      <select
        value={procesoId}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        <option value="">
          Seleccione un proceso
        </option>

        {procesos.map((proceso) => (
          <option
            key={proceso.id}
            value={proceso.id}
          >
            {proceso.nombre}
          </option>
        ))}
      </select>
    </div>
  );
}