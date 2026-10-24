import { useLocation, useNavigate } from "react-router-dom";

import { DashboardHeader } from "../../DashboardHeader/DashboardHeader";
import { colors } from "../../../theme/colors";

import { PlantaEstructuraPrincipal } from "./components/PlantaEstructura/PlantaEstructuraPrincipal";
import { MantenimientosLista } from "./components/Mantenimientos/MantenimientosLista";
import { MasterHubPrincipal } from "./components/MasterHubPrincipal"; // 👈 Nuestro nuevo Hub unificado

import "./Planta.css";

type PlantaTab = "estructura" | "master" | "mantenimientos";

function obtenerTab(pathname: string): PlantaTab {
  if (pathname.includes("/planta/master")) {
    return "master";
  }
  if (pathname === "/planta/mantenimientos") {
    return "mantenimientos";
  }
  return "estructura";
}

export function PlantaPanel() {
  const location = useLocation();
  const navigate = useNavigate();

  const tab = obtenerTab(location.pathname);

  function cambiarTab(nuevoTab: PlantaTab) {
    const rutas: Record<PlantaTab, string> = {
      estructura: "/planta",
      mantenimientos: "/planta/mantenimientos",
      master: "/planta/master",
    };

    navigate(rutas[nuevoTab], { replace: true });
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: colors.background,
      }}
    >
      <DashboardHeader isConnected={true} />

      <div className="planta-container">
        <div className="area-panel">
          {/* Botón de retorno general */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              marginBottom: 14,
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/dashboard", { replace: true })}
              className="btn-hover"
              style={{
                background: "transparent",
                border: `1.5px solid ${colors.border}`,
                borderRadius: 10,
                padding: "8px 14px",
                cursor: "pointer",
                color: colors.text.secondary,
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Volver al Dashboard
            </button>
          </div>

          {/* Navegación superior simplificada (Tabs de Planta) */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => cambiarTab("estructura")}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: tab === "estructura" ? '2px solid #9a5c25' : '1px solid #ddd',
                background: tab === "estructura" ? '#fffaf5' : '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Estructura de Planta
            </button>

            <button
              type="button"
              onClick={() => cambiarTab("master")}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: tab === "master" ? '2px solid #9a5c25' : '1px solid #ddd',
                background: tab === "master" ? '#fffaf5' : '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Master Completo
            </button>

            <button
              type="button"
              onClick={() => cambiarTab("mantenimientos")}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: tab === "mantenimientos" ? '2px solid #9a5c25' : '1px solid #ddd',
                background: tab === "mantenimientos" ? '#fffaf5' : '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Mantenimientos
            </button>
          </div>

          {/* Renderizado de vistas */}
          {tab === "estructura" && <PlantaEstructuraPrincipal />}
          {tab === "master" && <MasterHubPrincipal />}
          {tab === "mantenimientos" && <MantenimientosLista />}
        </div>
      </div>
    </div>
  );
}