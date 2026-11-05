import { useState } from "react";

interface NivelSeleccion {
  areaId?: string;
  equipoId?: string;
  componenteId?: string;
  repuestoId?: string;
}

interface JerarquiaSelectorProps {
  onSelectNivel: (nivel: NivelSeleccion, nombreSeleccionado: string) => void;
}

// Datos de ejemplo estructurados para Mina y Planta (Nexa Resources)
const AREAS_PLANTA = [
  {
    id: "mina",
    nombre: "Mina Subterránea",
    equipos: [
      {
        id: "eq-01",
        nombre: "Ventilador Principal V-01",
        componentes: [
          {
            id: "comp-01",
            nombre: "Motor Eléctrico principal",
            repuestos: [{ id: "rep-01", nombre: "Rodamiento de Rodillos 22220" }, { id: "rep-02", nombre: "Devanado Stator" }]
          },
          {
            id: "comp-02",
            nombre: "Sistema de Lubricación",
            repuestos: [{ id: "rep-03", nombre: "Bomba de Aceite" }, { id: "rep-04", nombre: "Filtro de Malla" }]
          }
        ]
      },
      {
        id: "eq-02",
        nombre: "Jumbos de Perforación J-04",
        componentes: [
          {
            id: "comp-03",
            nombre: "Martillo Hidráulico",
            repuestos: [{ id: "rep-05", nombre: "Pistón de Impacto" }, { id: "rep-06", nombre: "Sellos de Alta Presión" }]
          }
        ]
      }
    ]
  },
  {
    id: "planta",
    nombre: "Planta Concentradora",
    equipos: [
      {
        id: "eq-03",
        nombre: "Molino de Bolas M-01",
        componentes: [
          {
            id: "comp-04",
            nombre: "Piñón y Corona",
            repuestos: [{ id: "rep-07", nombre: "Segmentos de Carcasa" }]
          },
          {
            id: "comp-05",
            nombre: "Lubricación Forzada",
            repuestos: [{ id: "rep-08", nombre: "Intercambiador de Calor" }]
          }
        ]
      }
    ]
  }
];

export function JerarquiaSelector({ onSelectNivel }: JerarquiaSelectorProps) {
  const [areaSelected, setAreaSelected] = useState<string | null>(null);
  const [equipoSelected, setEquipoSelected] = useState<any | null>(null);
  const [componenteSelected, setComponenteSelected] = useState<any | null>(null);

  const areaObj = AREAS_PLANTA.find(a => a.id === areaSelected);

  return (
    <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "20px" }}>
      <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#0f172a" }}>
        📍 Navegador de Jerarquía Operacional (Paso a Paso)
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        
        {/* NIVEL 1: ÁREA */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>1. Seleccionar Área</label>
          <select 
            className="form-control"
            value={areaSelected || ""}
            onChange={(e) => {
              setAreaSelected(e.target.value);
              setEquipoSelected(null);
              setComponenteSelected(null);
              onSelectNivel({ areaId: e.target.value }, e.target.options[e.target.selectedIndex].text);
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
          >
            <option value="">-- Seleccione Área --</option>
            {AREAS_PLANTA.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
        </div>

        {/* NIVEL 2: EQUIPO */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>2. Seleccionar Equipo</label>
          <select 
            disabled={!areaSelected}
            className="form-control"
            value={equipoSelected?.id || ""}
            onChange={(e) => {
              const eq = areaObj?.equipos.find(item => item.id === e.target.value);
              setEquipoSelected(eq || null);
              setComponenteSelected(null);
              onSelectNivel({ areaId: areaSelected || undefined, equipoId: e.target.value }, eq?.nombre || "");
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: !areaSelected ? "#f1f5f9" : "#fff" }}
          >
            <option value="">-- Seleccione Equipo --</option>
            {areaObj?.equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
          </select>
        </div>

        {/* NIVEL 3: COMPONENTE */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>3. Componente (Opcional)</label>
          <select 
            disabled={!equipoSelected}
            className="form-control"
            value={componenteSelected?.id || ""}
            onChange={(e) => {
              const comp = equipoSelected?.componentes.find((c: any) => c.id === e.target.value);
              setComponenteSelected(comp || null);
              onSelectNivel({ areaId: areaSelected || undefined, equipoId: equipoSelected.id, componenteId: e.target.value }, comp?.nombre || "");
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: !equipoSelected ? "#f1f5f9" : "#fff" }}
          >
            <option value="">-- Todo el Equipo --</option>
            {equipoSelected?.componentes.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        {/* NIVEL 4: REPUESTO */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>4. Repuesto / Pieza (Opcional)</label>
          <select 
            disabled={!componenteSelected}
            className="form-control"
            onChange={(e) => {
              const rep = componenteSelected?.repuestos.find((r: any) => r.id === e.target.value);
              onSelectNivel({ areaId: areaSelected || undefined, equipoId: equipoSelected.id, componenteId: componenteSelected.id, repuestoId: e.target.value }, rep?.nombre || "");
            }}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: !componenteSelected ? "#f1f5f9" : "#fff" }}
          >
            <option value="">-- Todo el Componente --</option>
            {componenteSelected?.repuestos.map((r: any) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>

      </div>
    </div>
  );
}