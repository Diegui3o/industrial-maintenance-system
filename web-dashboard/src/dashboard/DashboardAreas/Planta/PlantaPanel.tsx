import { useState } from "react";

import { DashboardHeader } from "../../DashboardHeader/DashboardHeader";
import { colors } from "../../../theme/colors";

import { PlantaEstructuraPrincipal } from "./components/PlantaEstructura/PlantaEstructuraPrincipal";
import { MantenimientosLista } from "./components/Mantenimientos/MantenimientosLista";
import { EquiposLista } from "./components/Equipos/EquiposLista";
import { MaestroGeneral } from "./components/MaestroGeneral/MaestroGeneral";

import "./Planta.css";

type PlantaTab =
  | "estructura"
  | "maestro-general"
  | "mantenimientos"
  | "equipos";

export function PlantaPanel() {
  const [tab, setTab] =
    useState<PlantaTab>("estructura");

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
          <div className="area-options">
            <button
              type="button"
              className={
                tab === "estructura"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("estructura")
              }
            >
              Estructura
            </button>

            <button
              type="button"
              className={
                tab === "mantenimientos"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("mantenimientos")
              }
            >
              Mantenimientos
            </button>

            <button
              type="button"
              className={
                tab === "equipos"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("equipos")
              }
            >
              Equipos
            </button>

            <button
              type="button"
              className={
                tab === "maestro-general"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setTab("maestro-general")
              }
            >
              Maestro General
            </button>
          </div>

          <div className="area-content">
            {tab === "estructura" && (
              <PlantaEstructuraPrincipal />
            )}

            {tab === "mantenimientos" && (
              <MantenimientosLista />
            )}

            {tab === "equipos" && (
              <EquiposLista />
            )}
            {tab === "maestro-general" && (
              <MaestroGeneral />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}