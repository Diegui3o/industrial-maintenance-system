import { useEffect, useState } from "react";

import {
  obtenerMantenimientoCompleto,
} from "../../../dashboard/services/mantenimientoApi";

import MantenimientoGeneral from "../components/MantenimientoGeneral";
import MantenimientoDetalle from "../components/MantenimientoDetalle";
import MantenimientoDetalleForm from "../components/MantenimientoDetalleForm";
import MantenimientoNoProgramado from "../components/MantenimientoNoProgramado";

import MantenimientoRegistrosSemana from "./MantenimientoRegistrosSemana";
import ProgramacionSemana from "../components/programacion/ProgramacionSemana";

import { DashboardHeader } from "../../../dashboard/DashboardHeader/DashboardHeader";

import "./MantenimientoPage.css";

type Props = {
  equipoId?: number;
  mantenimientoId?: number;
};

export default function MantenimientoPage({
  mantenimientoId,
}: Props) {
  const [detalle, setDetalle] =
    useState<any | null>(null);

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState("");

  const [seleccionado, setSeleccionado] =
    useState<number | undefined>(mantenimientoId);

  const [noProgramado, setNoProgramado] =
    useState(false);

  useEffect(() => {
    setSeleccionado(mantenimientoId);
  }, [mantenimientoId]);

  useEffect(() => {
    if (seleccionado) {
      cargarDetalle(seleccionado);
    } else {
      setDetalle(null);
    }
  }, [seleccionado]);

  async function cargarDetalle(id: number) {
    try {
      setCargando(true);
      setError("");

      const data =
        await obtenerMantenimientoCompleto(id);

      setDetalle(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el mantenimiento."
      );
    } finally {
      setCargando(false);
    }
  }

  async function refrescar() {
    if (seleccionado) {
      await cargarDetalle(seleccionado);
    }
  }

  const idMantenimiento =
    detalle?.mantenimiento?.id ||
    detalle?.id ||
    seleccionado;
    
  return (
    <div className="mantenimiento-page">

      <DashboardHeader isConnected={true} />

      <div className="mantenimiento-toolbar">

        <div>
          <h1 className="mantenimiento-title">
            Mantenimiento
          </h1>

          <span className="mantenimiento-subtitle">
            Gestión de órdenes, trabajos y paradas
          </span>
        </div>

        <div className="mantenimiento-toolbar-actions">

          <div className="mantenimiento-actions">

            <button
              type="button"
              className="mantenimiento-btn"
              onClick={() =>
                setNoProgramado(true)
              }
            >
              + Registrar no programado
            </button>

          </div>

        </div>

      </div>

      {error && (
        <div className="mantenimiento-error">
          {error}
        </div>
      )}

      {noProgramado && (
        <MantenimientoNoProgramado
          onCerrar={() =>
            setNoProgramado(false)
          }
        />
      )}

      <div className="mantenimiento-layout">

        <aside className="mantenimiento-sidebar">

          <MantenimientoRegistrosSemana
            seleccionado={seleccionado}
            onSeleccionar={(id) => {
              setSeleccionado(id);
            }}
          />

        </aside>

        <main className="mantenimiento-main">

          <ProgramacionSemana />

          {cargando ? (

            <div className="mantenimiento-main-empty">
              <strong>
                Cargando mantenimiento...
              </strong>
            </div>

          ) : !idMantenimiento ? (

            <div className="mantenimiento-main-empty">
              <strong>
                Selecciona un mantenimiento
              </strong>

              <span>
                Selecciona un registro de la semana
                para consultar su información.
              </span>
            </div>

          ) : !detalle ? (

            <div className="mantenimiento-main-empty">
              <strong>
                No se pudo cargar el mantenimiento
              </strong>
            </div>

          ) : (

            <>
              <MantenimientoGeneral
                mantenimiento={
                  detalle.mantenimiento ||
                  detalle
                }
                onActualizado={refrescar}
              />

              <MantenimientoDetalleForm
                mantenimientoId={idMantenimiento}
                onCreado={refrescar}
              />

              <MantenimientoDetalle
                mantenimientoId={idMantenimiento}
              />
            </>

          )}

        </main>
      </div>

    </div>
  );
}