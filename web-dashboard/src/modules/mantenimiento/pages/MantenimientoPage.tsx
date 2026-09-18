import { useEffect, useState } from "react";

import {
  obtenerMantenimientoCompleto,
  listarMantenimientosEquipo,
} from "../../../dashboard/services/mantenimientoApi";

import MantenimientoGeneral from "../components/MantenimientoGeneral";
import MantenimientoDetalle from "../components/MantenimientoDetalle";
import MantenimientoDetalleForm from "../components/MantenimientoDetalleForm";
import MantenimientoNoProgramado from "../components/MantenimientoNoProgramado";

import { useSearchParams } from "react-router-dom";
import { getEquipos } from "../../../dashboard/DashboardAreas/Planta/services/equiposApi";

import ProgramacionSemana from "../components/programacion/ProgramacionSemana";
import { DashboardHeader } from "../../../dashboard/DashboardHeader/DashboardHeader";

import "./MantenimientoPage.css";

type Props = {
  equipoId?: number;
  mantenimientoId?: number;
};

export default function MantenimientoPage({
  equipoId,
  mantenimientoId,
}: Props) {
  const [lista, setLista] = useState<any[]>([]);
  const [detalle, setDetalle] = useState<any | null>(null);
  const [cargando, setCargando] = useState(false);
  const [seleccionado, setSeleccionado] =
    useState<number | undefined>(mantenimientoId);

  const [error, setError] = useState("");
  const [equipos, setEquipos] = useState<any[]>([]);
  const [noProgramado, setNoProgramado] = useState(false);

  const [searchParams] = useSearchParams();

  const equipoIdQuery = Number(searchParams.get("equipoId"));

  const equipoActualId =
    equipoIdQuery > 0 ? equipoIdQuery : equipoId;

  const [equipoSeleccionado, setEquipoSeleccionado] =
    useState<number | undefined>(equipoActualId);

  useEffect(() => {
    if (equipoActualId) {
      setEquipoSeleccionado(equipoActualId);
      return;
    }

    getEquipos()
      .then(setEquipos)
      .catch(() =>
        setError("No se pudieron cargar los equipos.")
      );
  }, [equipoActualId]);

  useEffect(() => {
    setSeleccionado(mantenimientoId);
  }, [mantenimientoId]);

  useEffect(() => {
    cargarLista();
  }, [equipoSeleccionado]);

  useEffect(() => {
    if (seleccionado) {
      cargarDetalle(seleccionado);
    } else {
      setDetalle(null);
    }
  }, [seleccionado]);

  async function cargarLista() {
    if (!equipoSeleccionado) {
      setLista([]);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const data =
        await listarMantenimientosEquipo(equipoSeleccionado);

      setLista(data || []);

      if (
        mantenimientoId &&
        data?.some(
          (item: any) => item.id === mantenimientoId
        )
      ) {
        setSeleccionado(mantenimientoId);
      } else if (!seleccionado && data?.length) {
        setSeleccionado(data[0].id);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar mantenimiento."
      );
    } finally {
      setCargando(false);
    }
  }

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
    await cargarLista();

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

          {!equipoActualId && (
            <select
              value={equipoSeleccionado ?? ""}
              onChange={(e) => {
                const id = Number(e.target.value);

                setEquipoSeleccionado(
                  id || undefined
                );

                setSeleccionado(undefined);
                setDetalle(null);
              }}
            >
              <option value="">
                Seleccionar equipo...
              </option>

              {equipos.map((equipo) => (
                <option
                  key={equipo.id}
                  value={equipo.id}
                >
                  {equipo.codigo} - {equipo.nombre}
                </option>
              ))}
            </select>
          )}
          <div className="mantenimiento-actions">
            <button
              type="button"
              className="mantenimiento-btn"
              onClick={() => setNoProgramado(true)}
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
          onCerrar={() => setNoProgramado(false)}
        />
      )}
      <div className="mantenimiento-layout">

        <aside className="mantenimiento-sidebar">

          <div className="mantenimiento-sidebar-header">
            <strong>Registros</strong>

            <span className="mantenimiento-count">
              {lista.length}
            </span>
          </div>

          {cargando && lista.length === 0 ? (

            <div className="mantenimiento-empty">
              Cargando...
            </div>

          ) : lista.length === 0 ? (

            <div className="mantenimiento-empty">

              <strong>
                No hay mantenimientos registrados
              </strong>

              <p>
                {equipoActualId
                  ? "Puedes crear el primer mantenimiento de este equipo."
                  : "Selecciona un equipo para consultar sus mantenimientos."}
              </p>

            </div>

          ) : (

            lista.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`mantenimiento-item ${
                  seleccionado === item.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setSeleccionado(item.id)
                }
              >
                <span className="mantenimiento-item-title">
                  Mantenimiento #{item.id}
                </span>

                <span className="mantenimiento-item-info">
                  {item.tipo_intervencion ||
                    "Sin intervención"}
                </span>

                <span className="mantenimiento-item-status">
                  {item.estado_falla ||
                    "sin estado"}
                </span>
              </button>
            ))

          )}

        </aside>

        <main className="mantenimiento-main">

          <ProgramacionSemana />

          {!idMantenimiento ? (

            <div className="mantenimiento-main-empty">

              <strong>
                Selecciona un mantenimiento
              </strong>

              <span>
                O crea uno nuevo para comenzar.
              </span>

            </div>

          ) : !detalle ? (

            <div className="mantenimiento-main-empty">
              Cargando mantenimiento...
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