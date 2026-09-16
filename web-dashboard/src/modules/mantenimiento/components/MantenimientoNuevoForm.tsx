import { useState } from "react";
import { crearMantenimiento } from "../../../dashboard/services/mantenimientoApi";

type Props = {
  equipoId: number;
  onCreado: (id?: number) => void;
  onCancelar: () => void;
};

const inicial = {
  fecha_reporte: new Date().toISOString().slice(0, 10),
  fase: "",
  taller: "",
  tipo_criticidad: "",
  sistema: "",
  tipo_intervencion: "",
  modo_falla: "",
  descripcion_evento: "",
  estado_falla: "abierta",
  prioridad: "",
};

export default function MantenimientoNuevoForm({
  equipoId,
  onCreado,
  onCancelar,
}: Props) {
  const [form, setForm] = useState(inicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  function cambiar(campo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function guardar() {
    if (!form.fase.trim()) {
      setError("La fase es obligatoria.");
      return;
    }

    if (!form.taller.trim()) {
      setError("El taller es obligatorio.");
      return;
    }

    if (!form.tipo_intervencion.trim()) {
      setError(
        "El tipo de intervención es obligatorio."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const creado = await crearMantenimiento({
        equipo_id: equipoId,
        ...form,
      });

      const id =
        creado?.id ||
        creado?.data?.id;

      onCreado(id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear el mantenimiento."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          Nuevo mantenimiento
        </h2>

        <button
          type="button"
          onClick={onCancelar}
          style={styles.close}
        >
          ×
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <div style={styles.grid}>
        <Field
          label="Fecha reporte"
          type="date"
          value={form.fecha_reporte}
          onChange={(v) =>
            cambiar("fecha_reporte", v)
          }
        />

        <Field
          label="Fase *"
          value={form.fase}
          onChange={(v) => cambiar("fase", v)}
        />

        <Field
          label="Taller *"
          value={form.taller}
          onChange={(v) =>
            cambiar("taller", v)
          }
        />

        <Field
          label="Tipo intervención *"
          value={form.tipo_intervencion}
          onChange={(v) =>
            cambiar("tipo_intervencion", v)
          }
        />

        <Field
          label="Tipo criticidad"
          value={form.tipo_criticidad}
          onChange={(v) =>
            cambiar("tipo_criticidad", v)
          }
        />

        <Field
          label="Sistema"
          value={form.sistema}
          onChange={(v) =>
            cambiar("sistema", v)
          }
        />

        <Field
          label="Modo de falla"
          value={form.modo_falla}
          onChange={(v) =>
            cambiar("modo_falla", v)
          }
        />

        <Field
          label="Prioridad"
          value={form.prioridad}
          onChange={(v) =>
            cambiar("prioridad", v)
          }
        />

        <Field
          label="Estado"
          value={form.estado_falla}
          onChange={(v) =>
            cambiar("estado_falla", v)
          }
        />
      </div>

      <label style={styles.label}>
        Descripción del evento
      </label>

      <textarea
        value={form.descripcion_evento}
        onChange={(e) =>
          cambiar(
            "descripcion_evento",
            e.target.value
          )
        }
        rows={4}
        style={styles.textarea}
      />

      <div style={styles.actions}>
        <button
          type="button"
          onClick={onCancelar}
          disabled={guardando}
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
            ? "Creando..."
            : "Crear mantenimiento"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={styles.input}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    border: "1px solid #fed7aa",
    borderRadius: 10,
    background: "#fff7ed",
    padding: 18,
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    margin: 0,
    fontSize: 19,
  },

  close: {
    border: 0,
    background: "transparent",
    fontSize: 24,
    cursor: "pointer",
    color: "#6b7280",
  },

  error: {
    marginBottom: 14,
    padding: 10,
    borderRadius: 8,
    background: "#fee2e2",
    color: "#991b1b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 14,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: "9px 10px",
    background: "#fff",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: 6,
    border: "1px solid #d1d5db",
    borderRadius: 6,
    padding: 10,
    resize: "vertical",
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
  },

  cancel: {
    border: "1px solid #d1d5db",
    background: "#fff",
    borderRadius: 6,
    padding: "9px 15px",
    cursor: "pointer",
  },

  save: {
    border: "none",
    background: "#ea580c",
    color: "#fff",
    borderRadius: 6,
    padding: "9px 15px",
    cursor: "pointer",
    fontWeight: 600,
  },
};