interface FiltrosEstructuraProps {
  fase: string;
  proceso: string;
  subproceso: string;
  equipo: string;
  componente: string;

  fases: string[];
  procesos: string[];
  subprocesos: string[];
  equipos: string[];
  componentes: string[];

  onFaseChange: (valor: string) => void;
  onProcesoChange: (valor: string) => void;
  onSubprocesoChange: (valor: string) => void;
  onEquipoChange: (valor: string) => void;
  onComponenteChange: (valor: string) => void;
}

export function FiltrosEstructura({
  fase,
  proceso,
  subproceso,
  equipo,
  componente,

  fases,
  procesos,
  subprocesos,
  equipos,
  componentes,

  onFaseChange,
  onProcesoChange,
  onSubprocesoChange,
  onEquipoChange,
  onComponenteChange,
}: FiltrosEstructuraProps) {
  const equiposFiltrados = equipos.filter((valor) =>
    valor.toLowerCase().includes(equipo.trim().toLowerCase()),
  );

  const componentesFiltrados = componentes.filter((valor) =>
    valor.toLowerCase().includes(componente.trim().toLowerCase()),
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: '#ffffff',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #e2d2c2',
      marginBottom: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 🧭 Fila única de Filtros Compactos en Horizontales (Grid Adaptable) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Selector de Fase */}
        <select
          value={fase}
          onChange={(event) => onFaseChange(event.target.value)}
          style={{
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid #dcd6ce',
            fontSize: '11px',
            background: '#fff',
            color: '#333',
            outline: 'none',
            width: '100%'
          }}
        >
          <option value="">Fase: Todas</option>
          {fases.map((valor) => (
            <option key={valor} value={valor}>{valor}</option>
          ))}
        </select>

        {/* Selector de Proceso */}
        <select
          value={proceso}
          onChange={(event) => onProcesoChange(event.target.value)}
          style={{
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid #dcd6ce',
            fontSize: '11px',
            background: '#fff',
            color: '#333',
            outline: 'none',
            width: '100%'
          }}
        >
          <option value="">Proceso: Todos</option>
          {procesos.map((valor) => (
            <option key={valor} value={valor}>{valor}</option>
          ))}
        </select>

        {/* Selector de Subproceso */}
        <select
          value={subproceso}
          onChange={(event) => onSubprocesoChange(event.target.value)}
          style={{
            padding: '7px 10px',
            borderRadius: '6px',
            border: '1px solid #dcd6ce',
            fontSize: '11px',
            background: '#fff',
            color: '#333',
            outline: 'none',
            width: '100%'
          }}
        >
          <option value="">Subproceso: Todos</option>
          {subprocesos.map((valor) => (
            <option key={valor} value={valor}>{valor}</option>
          ))}
        </select>

        {/* Buscador de Equipo con Sugerencias */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            background: '#fff',
            borderRadius: '6px',
            border: '1px solid #dcd6ce'
          }}>
            <span style={{ paddingLeft: '8px', fontSize: '11px', color: '#888' }}>🔍</span>
            <input
              type="text"
              value={equipo}
              onChange={(event) => onEquipoChange(event.target.value)}
              placeholder="Buscar equipo..."
              autoComplete="off"
              style={{
                width: '100%',
                padding: '7px 8px',
                border: 'none',
                fontSize: '11px',
                outline: 'none',
                background: 'transparent'
              }}
            />
          </div>

          {equipo.trim() && equiposFiltrados.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              zIndex: 10,
              maxHeight: '150px',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {equiposFiltrados.slice(0, 8).map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => onEquipoChange(valor)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '6px 10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f4ece4')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {valor}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buscador de Componente con Sugerencias */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            background: '#fff',
            borderRadius: '6px',
            border: '1px solid #dcd6ce'
          }}>
            <span style={{ paddingLeft: '8px', fontSize: '11px', color: '#888' }}>🔍</span>
            <input
              type="text"
              value={componente}
              onChange={(event) => onComponenteChange(event.target.value)}
              placeholder="Buscar componente..."
              autoComplete="off"
              style={{
                width: '100%',
                padding: '7px 8px',
                border: 'none',
                fontSize: '11px',
                outline: 'none',
                background: 'transparent'
              }}
            />
          </div>

          {componente.trim() && componentesFiltrados.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
              zIndex: 10,
              maxHeight: '150px',
              overflowY: 'auto',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {componentesFiltrados.slice(0, 8).map((valor) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => onComponenteChange(valor)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '6px 10px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f4ece4')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {valor}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}