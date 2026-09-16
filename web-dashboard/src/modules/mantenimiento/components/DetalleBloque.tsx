import { useState } from "react";

import {
  eliminarActividad,
  eliminarAvance,
  eliminarPersonal,
  eliminarProgramacion,
  eliminarEjecucion,
  eliminarMaterial,
  eliminarParada,
} from "../../../dashboard/services/mantenimientoApi";

import DetalleEditor from "./DetalleEditor";
import { formatearClave, formatearValor } from "./detalleUtils";

export type Bloque = {
  tipo: string;
  titulo: string;
  datos: any[];
};

type Props = {
  bloque: Bloque;
  onActualizado: () => void;
};

export default function DetalleBloque({
  bloque,
  onActualizado,
}: Props) {
  const [editando, setEditando] = useState<any>(null);
  const [eliminando, setEliminando] = useState<number | null>(null);

  const eliminar = async (item: any) => {
    if (!item?.id) return;

    const confirmar = window.confirm(
      `¿Eliminar este registro de ${bloque.titulo}?`
    );

    if (!confirmar) return;

    try {
      setEliminando(item.id);

      switch (bloque.tipo) {
        case "actividad":
          await eliminarActividad(item.id);
          break;

        case "avance":
          await eliminarAvance(item.id);
          break;

        case "personal":
          await eliminarPersonal(item.id);
          break;

        case "programacion":
          await eliminarProgramacion(item.id);
          break;

        case "ejecucion":
          await eliminarEjecucion(item.id);
          break;

        case "material":
          await eliminarMaterial(item.id);
          break;

        case "parada":
          await eliminarParada(item.id);
          break;

        case "historial":
          return;

        default:
          throw new Error("Tipo de detalle no soportado.");
      }

      onActualizado();
    } catch (error: any) {
      window.alert(
        error?.message || "No se pudo eliminar el registro."
      );
    } finally {
      setEliminando(null);
    }
  };

  return (
    <section style={section}>
      <div style={header}>
        <h3 style={title}>{bloque.titulo}</h3>

        <span style={count}>
          {bloque.datos?.length ?? 0}
        </span>
      </div>

      {bloque.datos?.length === 0 ? (
        <div style={empty}>
          No hay registros.
        </div>
      ) : (
        <div style={list}>
          {bloque.datos.map((item) => (
            <div key={item.id} style={row}>
              <div style={data}>
                {Object.entries(item)
                  .filter(([key]) => key !== "id")
                  .map(([key, value]) => (
                    <div key={key} style={field}>
                      <strong>
                        {formatearClave(key)}:
                      </strong>{" "}
                      {formatearValor(value)}
                    </div>
                  ))}
              </div>

              {bloque.tipo !== "historial" && (
                <div style={actions}>
                  <button
                    type="button"
                    onClick={() => setEditando(item)}
                    style={editButton}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => eliminar(item)}
                    disabled={eliminando === item.id}
                    style={deleteButton}
                  >
                    {eliminando === item.id
                      ? "Eliminando..."
                      : "Eliminar"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editando && (
        <DetalleEditor
          tipo={bloque.tipo}
          item={editando}
          onCancel={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            onActualizado();
          }}
        />
      )}
    </section>
  );
}

const section: React.CSSProperties = {
  marginBottom: 24,
};

const header: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 12,
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
};

const count: React.CSSProperties = {
  minWidth: 24,
  height: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 12,
  background: "#f3f4f6",
  fontSize: 12,
  fontWeight: 600,
};

const list: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const row: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 14,
  background: "#fff",
};

const data: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 8,
};

const field: React.CSSProperties = {
  fontSize: 13,
  color: "#374151",
};

const actions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 14,
};

const editButton: React.CSSProperties = {
  border: "1px solid #f97316",
  background: "#fff",
  color: "#ea580c",
  borderRadius: 6,
  padding: "7px 12px",
  cursor: "pointer",
};

const deleteButton: React.CSSProperties = {
  border: "1px solid #dc2626",
  background: "#fff",
  color: "#dc2626",
  borderRadius: 6,
  padding: "7px 12px",
  cursor: "pointer",
};

const empty: React.CSSProperties = {
  padding: 16,
  borderRadius: 8,
  background: "#f9fafb",
  color: "#6b7280",
  fontSize: 14,
};