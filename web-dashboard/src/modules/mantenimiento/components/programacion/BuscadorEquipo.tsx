import type { Equipo } from "./types";

type Props = {
  equipo: Equipo | null;
  equipoBusqueda: string;
  setEquipoBusqueda: (val: string) => void;
  equipos: Equipo[];
  cargando: boolean;
  seleccionarEquipo: (item: Equipo) => void;
  cambiarEquipo: () => void;
};
import "./programar.css";

export default function BuscadorEquipo({
  equipo,
  equipoBusqueda,
  setEquipoBusqueda,
  equipos,
  cargando,
  seleccionarEquipo,
  cambiarEquipo,
}: Props) {
  const resultados = equipos.filter((item) => {
    const texto = equipoBusqueda.toLowerCase().trim();
    if (!texto) return false;
    return (
      item.codigo?.toLowerCase().includes(texto) ||
      item.nombre?.toLowerCase().includes(texto)
    );
  });

  return (
    <section className="prog-section">
      <div className="prog-section-title">Equipo</div>

      {!equipo ? (
        <div className="prog-equipment-search">
          <div className="prog-equipment-searchbox">
            <span className="prog-search-icon">⌕</span>
            <input
              value={equipoBusqueda}
              onChange={(e) => setEquipoBusqueda(e.target.value)}
              placeholder="Buscar equipo..."
              autoFocus
            />
            {equipoBusqueda && (
              <button
                type="button"
                className="prog-search-clear"
                onClick={() => setEquipoBusqueda("")}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>

          {equipoBusqueda && (
            <div className="prog-results">
              {cargando && (
                <div className="prog-no-results">Buscando equipos...</div>
              )}

              {!cargando &&
                resultados.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="prog-result"
                    onClick={() => seleccionarEquipo(item)}
                  >
                    <span className="prog-result-code">{item.codigo}</span>
                    <span className="prog-result-name">{item.nombre}</span>
                  </button>
                ))}

              {!cargando && resultados.length === 0 && (
                <div className="prog-no-results">No se encontraron equipos</div>
              )}

              {!cargando && resultados.length > 8 && (
                <div className="prog-results-more">
                  Mostrando 8 de {resultados.length} equipos
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="prog-equipment-selected">
          <div>
            <strong>{equipo.nombre}</strong>
            <span>{equipo.codigo}</span>
          </div>
          <button type="button" onClick={cambiarEquipo}>
            Cambiar
          </button>
        </div>
      )}

      {equipo && (
        <div className="prog-equipment-meta">
          <span>
            Fase: <strong>{equipo.fase || "Sin clasificar"}</strong>
          </span>
          <span>
            Área: <strong>{equipo.area || "—"}</strong>
          </span>
          <span>
            Tipo: <strong>{equipo.tipo || "—"}</strong>
          </span>
          <span>
            Ubicación: <strong>{equipo.ubicacion || "—"}</strong>
          </span>
        </div>
      )}
    </section>
  );
}