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
    valor
      .toLowerCase()
      .includes(equipo.trim().toLowerCase()),
  );

  const componentesFiltrados = componentes.filter((valor) =>
    valor
      .toLowerCase()
      .includes(componente.trim().toLowerCase()),
  );

  return (
    <section className="maestro-general-filtros">
      <div className="maestro-general-filtros-titulo">
        <span>FILTROS DE ESTRUCTURA</span>
      </div>

      <div className="maestro-general-filtros-grid">
        <div className="maestro-general-filtro">
          <label htmlFor="filtro-fase">
            Fase
          </label>

          <select
            id="filtro-fase"
            value={fase}
            onChange={(event) =>
              onFaseChange(event.target.value)
            }
          >
            <option value="">Todas</option>

            {fases.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </div>

        <div className="maestro-general-filtro">
          <label htmlFor="filtro-proceso">
            Proceso
          </label>

          <select
            id="filtro-proceso"
            value={proceso}
            onChange={(event) =>
              onProcesoChange(event.target.value)
            }
          >
            <option value="">Todos</option>

            {procesos.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </div>

        <div className="maestro-general-filtro">
          <label htmlFor="filtro-subproceso">
            Subproceso
          </label>

          <select
            id="filtro-subproceso"
            value={subproceso}
            onChange={(event) =>
              onSubprocesoChange(event.target.value)
            }
          >
            <option value="">Todos</option>

            {subprocesos.map((valor) => (
              <option key={valor} value={valor}>
                {valor}
              </option>
            ))}
          </select>
        </div>

        <div className="maestro-general-filtro maestro-general-filtro-buscador">
          <label htmlFor="filtro-equipo">
            Equipo
          </label>

          <div className="maestro-general-input-wrapper">
            <span
              className="maestro-general-input-icono"
              aria-hidden="true"
            >
              🔎
            </span>

            <input
              id="filtro-equipo"
              type="text"
              value={equipo}
              onChange={(event) =>
                onEquipoChange(event.target.value)
              }
              placeholder="Buscar equipo..."
              autoComplete="off"
            />
          </div>

          {equipo.trim() &&
            equiposFiltrados.length > 0 && (
              <div className="maestro-general-filtro-sugerencias">
                {equiposFiltrados
                  .slice(0, 8)
                  .map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() =>
                        onEquipoChange(valor)
                      }
                    >
                      {valor}
                    </button>
                  ))}
              </div>
            )}
        </div>

        <div className="maestro-general-filtro maestro-general-filtro-buscador">
          <label htmlFor="filtro-componente">
            Componente
          </label>

          <div className="maestro-general-input-wrapper">
            <span
              className="maestro-general-input-icono"
              aria-hidden="true"
            >
              🔎
            </span>

            <input
              id="filtro-componente"
              type="text"
              value={componente}
              onChange={(event) =>
                onComponenteChange(event.target.value)
              }
              placeholder="Buscar componente..."
              autoComplete="off"
            />
          </div>

          {componente.trim() &&
            componentesFiltrados.length > 0 && (
              <div className="maestro-general-filtro-sugerencias">
                {componentesFiltrados
                  .slice(0, 8)
                  .map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() =>
                        onComponenteChange(valor)
                      }
                    >
                      {valor}
                    </button>
                  ))}
              </div>
            )}
        </div>
      </div>
    </section>
  );
}