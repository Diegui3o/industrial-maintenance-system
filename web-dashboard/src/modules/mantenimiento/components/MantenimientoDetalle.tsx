import { useEffect, useState } from "react";

import {
  listarActividades,
  listarAvances,
  listarPersonal,
  listarProgramacion,
  listarEjecuciones,
  listarMateriales,
  listarParadas,
  listarHistorial,
} from "../../../dashboard/services/mantenimientoApi";

import DetalleBloque from "./DetalleBloque";
import type { Bloque } from "./DetalleBloque";

type Props = {
  mantenimientoId: number;
};

export default function MantenimientoDetalle({
  mantenimientoId,
}: Props) {
  const [bloques, setBloques] = useState<Bloque[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargar();
  }, [mantenimientoId]);

  async function cargar() {
    try {
      setCargando(true);
      setError("");

      const [
        actividades,
        avances,
        personal,
        programacion,
        ejecuciones,
        materiales,
        paradas,
        historial,
      ] = await Promise.all([
        listarActividades(mantenimientoId),
        listarAvances(mantenimientoId),
        listarPersonal(mantenimientoId),
        listarProgramacion(mantenimientoId),
        listarEjecuciones(mantenimientoId),
        listarMateriales(mantenimientoId),
        listarParadas(mantenimientoId),
        listarHistorial(mantenimientoId),
      ]);

      setBloques([
        {
          titulo: "Actividades",
          tipo: "actividad",
          datos: actividades || [],
        },
        {
          titulo: "Avances",
          tipo: "avance",
          datos: avances || [],
        },
        {
          titulo: "Personal",
          tipo: "personal",
          datos: personal || [],
        },
        {
          titulo: "Programación",
          tipo: "programacion",
          datos: programacion || [],
        },
        {
          titulo: "Ejecución",
          tipo: "ejecucion",
          datos: ejecuciones || [],
        },
        {
          titulo: "Materiales",
          tipo: "material",
          datos: materiales || [],
        },
        {
          titulo: "Paradas",
          tipo: "parada",
          datos: paradas || [],
        },
        {
          titulo: "Historial",
          tipo: "historial",
          datos: historial || [],
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los detalles."
      );
    } finally {
      setCargando(false);
    }
  }

  if (cargando) {
    return (
      <section style={styles.container}>
        <p>Cargando detalles...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section style={styles.container}>
        <p style={styles.error}>{error}</p>
      </section>
    );
  }

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>
            Detalle del mantenimiento
          </h3>

          <p style={styles.subtitle}>
            Actividades, avances, personal, operación y trazabilidad.
          </p>
        </div>

        <button
          type="button"
          onClick={cargar}
          style={styles.refresh}
        >
          Actualizar
        </button>
      </div>

      {bloques.map((bloque) => (
        <DetalleBloque
          key={bloque.tipo}
          bloque={bloque}
          onActualizado={cargar}
        />
      ))}
    </section>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    margin: 0,
    fontSize: 18,
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13,
  },

  refresh: {
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: 7,
    padding: "7px 12px",
    cursor: "pointer",
  },

  error: {
    color: "#dc2626",
    fontSize: 13,
  },
};