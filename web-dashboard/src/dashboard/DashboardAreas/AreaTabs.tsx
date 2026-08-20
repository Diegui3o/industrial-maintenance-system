import "./AreaTabs.css";

export type Area =
  | "mina"
  | "planta"
  | "infraestructura";

interface AreaTabsProps {
  activeArea: Area;
  onChange: (area: Area) => void;
}

export function AreaTabs({
  activeArea,
  onChange,
}: AreaTabsProps) {
  return (
    <div className="area-tabs">
      <button
        className={activeArea === "mina" ? "active" : ""}
        onClick={() => onChange("mina")}
      >
        Mina
      </button>

      <button
        className={activeArea === "planta" ? "active" : ""}
        onClick={() => onChange("planta")}
      >
        Planta
      </button>

      <button
        className={
          activeArea === "infraestructura" ? "active" : ""
        }
        onClick={() => onChange("infraestructura")}
      >
        Infraestructura
      </button>
    </div>
  );
}