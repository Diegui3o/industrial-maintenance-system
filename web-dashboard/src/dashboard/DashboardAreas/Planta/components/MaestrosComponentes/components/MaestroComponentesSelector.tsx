interface MaestroComponentesSelectorProps {
  tipos: string[];
  tipoSeleccionado: string;
  onChange: (tipo: string) => void;
}

export function MaestroComponentesSelector({
  tipos,
  tipoSeleccionado,
  onChange,
}: MaestroComponentesSelectorProps) {
  return (
    <div className="maestro-componentes-selector">
      <label htmlFor="tipo-componente">
        Tipo de componente
      </label>

      <select
        id="tipo-componente"
        value={tipoSeleccionado}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {tipos.map((tipo) => (
          <option
            key={tipo}
            value={tipo}
          >
            {tipo}
          </option>
        ))}
      </select>
    </div>
  );
}