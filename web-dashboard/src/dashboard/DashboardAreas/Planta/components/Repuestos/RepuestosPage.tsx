import { useState, useEffect } from "react";

import { RepuestosCatalogo } from './RepuestosCatalogo';
import { RepuestoFicha } from "./RepuestoFicha";
import { RepuestoPanel } from "./RepuestoPanel";

import { type Repuesto } from "../../services/plantaRepuestosApi";

import "./Repuestos.css";

export function RepuestosPage() {
  const [fichaAbierta, setFichaAbierta] = useState<Repuesto | null>(null);
  const [panelAbierto, setPanelAbierto] = useState(false);

  function abrirNuevo() {
    setPanelAbierto(true);
  }

  function abrirFicha(repuesto: Repuesto) {
    setFichaAbierta(repuesto);
  }

  function cerrarPanel() {
    setPanelAbierto(false);
  }

  function cerrarFicha() {
    setFichaAbierta(null);
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && panelAbierto) {
        cerrarPanel();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panelAbierto]);

  return (
    <div className="repuestos-page">
      <header className="repuestos-header">
        <div className="repuestos-header-left">
          <h1>Catálogo de Repuestos</h1>
          <span className="repuestos-subtitle">
            Gestión de stock, especificaciones y compatibilidad
          </span>
        </div>
        <button className="repuestos-btn-crear" onClick={abrirNuevo}>
          <span>➕</span> Nuevo Repuesto
        </button>
      </header>

      <div className="repuestos-body">
        <div className={`repuestos-catalogo-zona ${fichaAbierta ? "con-ficha" : ""}`}>
          <RepuestosCatalogo onNuevo={abrirNuevo} onVer={abrirFicha} />
        </div>

        {fichaAbierta && (
          <div className="repuestos-ficha-zona">
            <RepuestoFicha
              repuesto={fichaAbierta}
              onVolver={cerrarFicha}
            />
          </div>
        )}

        <RepuestoPanel
          abierto={panelAbierto}
          onClosing={cerrarPanel}
        />
      </div>
    </div>
  );
}
