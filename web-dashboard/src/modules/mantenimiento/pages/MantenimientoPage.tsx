import { useEffect, useState } from "react";
import {
  obtenerMantenimientoCompleto,
  listarMantenimientosEquipo,
} from "../../../dashboard/services/mantenimientoApi";

import MantenimientoGeneral from "../components/MantenimientoGeneral";
import MantenimientoDetalle from "../components/MantenimientoDetalle";
import MantenimientoDetalleForm from "../components/MantenimientoDetalleForm";
import MantenimientoNuevoForm from "../components/MantenimientoNuevoForm";

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
  const [seleccionado, setSeleccionado] =
    useState<number | undefined>(mantenimientoId);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState(false);

  useEffect(() => {
    setSeleccionado(mantenimientoId);
  }, [mantenimientoId]);

  useEffect(() => {
    cargarLista();
  }, [equipoId]);

  useEffect(() => {
    if (seleccionado) {
      cargarDetalle(seleccionado);
    } else {
      setDetalle(null);
    }
  }, [seleccionado]);

  async function cargarLista() {
    if (!equipoId) {
      setLista([]);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const data = await listarMantenimientosEquipo(equipoId);

      setLista(data || []);

      if (
        mantenimientoId &&
        data?.some((item: any) => item.id === mantenimientoId)
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

      const data = await obtenerMantenimientoCompleto(id);

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

  async function creado(id?: number) {
    setNuevo(false);

    await cargarLista();

    if (id) {
      setSeleccionado(id);
    }
  }

  const idMantenimiento =
    detalle?.mantenimiento?.id ||
    detalle?.id ||
    seleccionado;

  return (
    <div className="mantenimiento-page">
      <header className="mantenimiento-header">
        <div>
          <h1 className="mantenimiento-title">
            Mantenimiento
          </h1>

          <span className="mantenimiento-subtitle">
            Gestión de órdenes, trabajos y paradas
          </span>
        </div>

        <button
          type="button"
          className="mantenimiento-new"
          onClick={() => {
            setNuevo(true);
            setError("");
          }}
        >
          + Nuevo mantenimiento
        </button>
      </header>

      {error && (
        <div className="mantenimiento-error">
          {error}
        </div>
      )}

      {nuevo && equipoId && (
        <MantenimientoNuevoForm
          equipoId={equipoId}
          onCreado={creado}
          onCancelar={() => setNuevo(false)}
        />
      )}

      {nuevo && !equipoId && (
        <div className="mantenimiento-main">
          <div className="mantenimiento-empty">
            <strong>
              Primero selecciona un equipo
            </strong>

            <p>
              Para registrar un mantenimiento debes
              asociarlo a un equipo existente.
            </p>
          </div>
        </div>
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
                {equipoId
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
                  seleccionado === item.id ? "active" : ""
                }`}
                onClick={() => setSeleccionado(item.id)}
              >
                <span className="mantenimiento-item-title">
                  Mantenimiento #{item.id}
                </span>

                <span className="mantenimiento-item-info">
                  {item.tipo_intervencion ||
                    "Sin intervención"}
                </span>

                <span className="mantenimiento-item-status">
                  {item.estado_falla || "sin estado"}
                </span>
              </button>
            ))
          )}
        </aside>

        <main className="mantenimiento-main">
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
                  detalle.mantenimiento || detalle
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