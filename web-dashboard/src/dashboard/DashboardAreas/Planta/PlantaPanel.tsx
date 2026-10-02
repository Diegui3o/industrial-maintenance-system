import { useState } from "react";

import { DashboardHeader } from "../../DashboardHeader/DashboardHeader";
import { colors } from "../../../theme/colors";

import { PlantaEstructuraPrincipal } from "./components/PlantaEstructura/PlantaEstructuraPrincipal";
import { MantenimientosLista } from "./components/Mantenimientos/MantenimientosLista";
import { EquiposLista } from "./components/Equipos/EquiposLista";
import { MaestroGeneral } from "./components/MaestroGeneral/MaestroGeneral";
import { MaestrosComponentes } from './components/MaestrosComponentes/MaestrosComponentes';

import "./Planta.css";

type PlantaTab =
  | "estructura"
  | "maestro-general"
  | "maestros-componentes"
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
              Master principal
            </button>
            <button
              type="button"
              onClick={() =>
                setTab("maestros-componentes")
              }
              className={
                tab === "maestros-componentes"
                  ? "activo"
                  : ""
              }
            >
              Maestros de componentes
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
            {tab === "maestros-componentes" && (
              <MaestrosComponentes />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}