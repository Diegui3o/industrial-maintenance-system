interface MaestroGeneralBusquedaProps {
  value: string;
  onChange: (valor: string) => void;
}

export function MaestroGeneralBusqueda({
  value,
  onChange,
}: MaestroGeneralBusquedaProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      width: '100%',
      maxWidth: '350px'
    }}>
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '14px',
          color: '#888'
        }}
      >
        🔍
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar equipo, tag o componente..."
        autoComplete="off"
        style={{
          width: '100%',
          padding: '8px 12px 8px 34px',
          borderRadius: '6px',
          border: '1px solid #dcd6ce',
          fontSize: '12px',
          outline: 'none',
          backgroundColor: '#fff',
          color: '#333'
        }}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          title="Limpiar búsqueda"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#888',
            padding: '2px 6px'
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}