import type { Componente, Equipo } from "./types";
import "./programar.css";

type Props = {
  equipo: Equipo | null;
  componentes: Componente[];
  componente: Componente | null;
  cargandoComponentes: boolean;
  cambiarComponente: (valor: string) => void;
};

export default function SelectorComponente({
  equipo,
  componentes,
  componente,
  cargandoComponentes,
  cambiarComponente,
}: Props) {
  if (!equipo) return null;

  return (
    <section className="prog-section">
      <div className="prog-section-title">Componente</div>

      <label>
        Componente
        <select
          value={componente?.id ?? ""}
          onChange={(e) => cambiarComponente(e.target.value)}
          disabled={cargandoComponentes}
        >
          <option value="">
            {cargandoComponentes
              ? "Cargando componentes..."
              : componentes.length === 0
              ? "Sin componentes registrados"
              : "Mantenimiento a nivel de equipo"}
          </option>

          {componentes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.tag ? `${item.tag} - ` : ""}
              {item.nombre}
              {item.codigo_sap ? ` (${item.codigo_sap})` : ""}
            </option>
          ))}
        </select>
      </label>

      {componente && (
        <div className="prog-equipment-meta">
          {componente.tag && (
            <span>
              TAG: <strong>{componente.tag}</strong>
            </span>
          )}
          {componente.tipo_componente && (
            <span>
              Tipo: <strong>{componente.tipo_componente}</strong>
            </span>
          )}
          {componente.marca && (
            <span>
              Marca: <strong>{componente.marca}</strong>
            </span>
          )}
          {componente.modelo && (
            <span>
              Modelo: <strong>{componente.modelo}</strong>
            </span>
          )}
        </div>
      )}
    </section>
  );
}