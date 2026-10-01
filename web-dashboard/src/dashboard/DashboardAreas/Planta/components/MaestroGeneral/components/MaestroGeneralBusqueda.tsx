interface MaestroGeneralBusquedaProps {
  value: string;
  onChange: (valor: string) => void;
}

export function MaestroGeneralBusqueda({
  value,
  onChange,
}: MaestroGeneralBusquedaProps) {
  return (
    <div className="maestro-general-busqueda">
      <span
        className="maestro-general-busqueda-icono"
        aria-hidden="true"
      >
        🔎
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="Buscar en el maestro..."
        autoComplete="off"
      />

      {value && (
        <button
          type="button"
          className="maestro-general-busqueda-limpiar"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
        >
          ×
        </button>
      )}
    </div>
  );
}