import { useState } from "react";

import {
  crearActividad,
  crearAvance,
  crearPersonal,
  crearProgramacion,
  crearEjecucion,
  crearMaterial,
  crearParada,
} from "../../../dashboard/services/mantenimientoApi";

import ActividadForm from "./forms/ActividadForm";
import AvanceForm from "./forms/AvanceForm";
import PersonalForm from "./forms/PersonalForm";
import ProgramacionForm from "./forms/ProgramacionForm";
import EjecucionForm from "./forms/EjecucionForm";
import MaterialForm from "./forms/MaterialForm";
import ParadaForm from "./forms/ParadaForm";

type Props = {
  mantenimientoId: number;
  onCreado: () => void;
};

const tipos = [
  { value: "actividad", label: "Actividad" },
  { value: "avance", label: "Avance" },
  { value: "personal", label: "Personal" },
  { value: "programacion", label: "Programación" },
  { value: "ejecucion", label: "Ejecución" },
  { value: "material", label: "Material" },
  { value: "parada", label: "Parada" },
];

export default function MantenimientoDetalleForm({
  mantenimientoId,
  onCreado,
}: Props) {
  const [tipo, setTipo] = useState("actividad");
  const [form, setForm] = useState<Record<string, any>>({});
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function cambiar(
    campo: string,
    valor: any
  ) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  function cambiarTipo(
    nuevoTipo: string
  ) {
    setTipo(nuevoTipo);
    setForm({});
    setError("");
  }

  async function guardar() {
    try {
      setGuardando(true);
      setError("");

      switch (tipo) {
        case "actividad":
          await crearActividad(
            mantenimientoId,
            form
          );
          break;

        case "avance":
          await crearAvance(
            mantenimientoId,
            form
          );
          break;

        case "personal":
          await crearPersonal(
            mantenimientoId,
            form
          );
          break;

        case "programacion":
          await crearProgramacion(
            mantenimientoId,
            form
          );
          break;

        case "ejecucion":
          await crearEjecucion(
            mantenimientoId,
            form
          );
          break;

        case "material":
          await crearMaterial(
            mantenimientoId,
            form
          );
          break;

        case "parada":
          await crearParada(
            mantenimientoId,
            form
          );
          break;
      }

      setForm({});
      onCreado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el registro."
      );
    } finally {
      setGuardando(false);
    }
  }

  function renderForm() {
    switch (tipo) {
      case "actividad":
        return (
          <ActividadForm
            form={form}
            cambiar={cambiar}
          />
        );

      case "avance":
        return (
          <AvanceForm
            form={form}
            cambiar={cambiar}
          />
        );

      case "personal":
        return (
          <PersonalForm
            form={form}
            cambiar={cambiar}
          />
        );

      case "programacion":
        return (
          <ProgramacionForm
            form={form}
            cambiar={cambiar}
          />
        );

      case "ejecucion":
        return (
          <EjecucionForm
            form={form}
            cambiar={cambiar}
          />
        );

      case "material":
        return (
          <MaterialForm
            form={form}
            cambiar={cambiar}
          />
        );

      case "parada":
        return (
          <ParadaForm
            form={form}
            cambiar={cambiar}
          />
        );

      default:
        return null;
    }
  }

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>
            Agregar detalle
          </h3>

          <p style={styles.subtitle}>
            Registra información adicional del mantenimiento.
          </p>
        </div>

        <select
          value={tipo}
          onChange={(e) =>
            cambiarTipo(e.target.value)
          }
          style={styles.select}
        >
          {tipos.map((opcion) => (
            <option
              key={opcion.value}
              value={opcion.value}
            >
              {opcion.label}
            </option>
          ))}
        </select>
      </div>

      <div style={styles.form}>
        {renderForm()}

        {error && (
          <p style={styles.error}>
            {error}
          </p>
        )}

        <div style={styles.actions}>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            style={styles.save}
          >
            {guardando
              ? "Guardando..."
              : "Agregar registro"}
          </button>
        </div>
      </div>
    </section>
  );
}

const styles = {
  container: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    background: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  title: {
    margin: 0,
    fontSize: 16,
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 13,
  },

  select: {
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "7px 10px",
    background: "#fff",
  },

  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },

  save: {
    border: 0,
    background: "#ea580c",
    color: "#fff",
    borderRadius: 6,
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },

  error: {
    margin: 0,
    color: "#dc2626",
    fontSize: 13,
  },
};