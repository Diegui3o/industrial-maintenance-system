import { useState } from "react";

import {
  actualizarActividad,
  actualizarAvance,
  actualizarPersonal,
  actualizarProgramacion,
  actualizarEjecucion,
  actualizarMaterial,
  actualizarParada,
} from "../../../dashboard/services/mantenimientoApi";

import ActividadEditor from "./editors/ActividadEditor";
import AvanceEditor from "./editors/AvanceEditor";
import PersonalEditor from "./editors/PersonalEditor";
import ProgramacionEditor from "./editors/ProgramacionEditor";
import EjecucionEditor from "./editors/EjecucionEditor";
import MaterialEditor from "./editors/MaterialEditor";
import ParadaEditor from "./editors/ParadaEditor";

type Props = {
  tipo: string;
  item: any;
  onCancel: () => void;
  onGuardado: () => void;
};

export default function DetalleEditor({
  tipo,
  item,
  onCancel,
  onGuardado,
}: Props) {
  const [form, setForm] = useState({
    ...item,
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function cambiar(
    campo: string,
    valor: any
  ) {
    setForm((prev: any) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function guardar() {
    try {
      setGuardando(true);
      setError("");

      switch (tipo) {
        case "actividad":
          await actualizarActividad(
            form.id,
            form
          );
          break;

        case "avance":
          await actualizarAvance(
            form.id,
            form
          );
          break;

        case "personal":
          await actualizarPersonal(
            form.id,
            form
          );
          break;

        case "programacion":
          await actualizarProgramacion(
            form.id,
            form
          );
          break;

        case "ejecucion":
          await actualizarEjecucion(
            form.id,
            form
          );
          break;

        case "material":
          await actualizarMaterial(
            form.id,
            form
          );
          break;

        case "parada":
          await actualizarParada(
            form.id,
            form
          );
          break;
      }

      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar."
      );
    } finally {
      setGuardando(false);
    }
  }

  function renderEditor() {
    switch (tipo) {
      case "actividad":
        return (
          <ActividadEditor
            form={form}
            cambiar={cambiar}
          />
        );

      case "avance":
        return (
          <AvanceEditor
            form={form}
            cambiar={cambiar}
          />
        );

      case "personal":
        return (
          <PersonalEditor
            form={form}
            cambiar={cambiar}
          />
        );

      case "programacion":
        return (
          <ProgramacionEditor
            form={form}
            cambiar={cambiar}
          />
        );

      case "ejecucion":
        return (
          <EjecucionEditor
            form={form}
            cambiar={cambiar}
          />
        );

      case "material":
        return (
          <MaterialEditor
            form={form}
            cambiar={cambiar}
          />
        );

      case "parada":
        return (
          <ParadaEditor
            form={form}
            cambiar={cambiar}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div style={styles.editor}>
      <h5 style={styles.title}>
        Editar registro #{form.id}
      </h5>

      {renderEditor()}

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      <div style={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancel}
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          style={styles.save}
        >
          {guardando
            ? "Guardando..."
            : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  editor: {
    border: "1px solid #fed7aa",
    borderRadius: 8,
    padding: 14,
    background: "#fff7ed",
  },

  title: {
    margin: "0 0 12px",
    fontSize: 14,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 14,
  },

  cancel: {
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: 6,
    padding: "7px 12px",
    cursor: "pointer",
  },

  save: {
    border: 0,
    background: "#ea580c",
    color: "#fff",
    borderRadius: 6,
    padding: "7px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },

  error: {
    color: "#dc2626",
    fontSize: 13,
  },
};