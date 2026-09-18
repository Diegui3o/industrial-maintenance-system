import { useEffect, useState } from "react";
import { crearMantenimiento } from "../../../dashboard/services/mantenimientoApi";
import "./MantenimientoNuevoForm.css";

type Props = {
  equipoId: number;
  onCreado: (id?: number) => void;
  onCancelar: () => void;
};

type Equipo = {
  id: number;
  codigo: string;
  nombre: string;
  fase?: string;
  fase_ubicacion?: string;
  area?: string;
  tipo?: string;
  ubicacion_fisica?: string;
};

const estados = [
  "abierta",
  "en_proceso",
  "cerrada",
];

export default function MantenimientoNuevoForm({
  equipoId,
  onCreado,
  onCancelar,
}: Props) {
  const [equipo, setEquipo] = useState<Equipo | null>(null);

  const [form, setForm] = useState({
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
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEquipo();
  }, [equipoId]);

  async function cargarEquipo() {
    try {
      const response = await fetch(`/api/equipos/${equipoId}`);

      if (!response.ok) {
        throw new Error("No se pudo cargar el equipo.");
      }

      const data: Equipo = await response.json();

      setEquipo(data);

      setForm((prev) => ({
        ...prev,
        fase:
          data.fase?.trim() ||
          data.fase_ubicacion?.trim() ||
          "",
        sistema: data.tipo?.trim() || "",
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el equipo."
      );
    }
  }

  function cambiar(campo: string, valor: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  async function guardar() {
    if (!form.taller.trim()) {
      setError("Selecciona el taller.");
      return;
    }

    if (!form.tipo_intervencion.trim()) {
      setError("Selecciona el tipo de intervención.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      const creado = await crearMantenimiento({
        equipo_id: equipoId,
        ...form,
      });

      onCreado(creado?.id || creado?.data?.id);
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
    <div className="mtto-form">
      <div className="mtto-form__top">
        <div>
          <span className="mtto-form__eyebrow">
            NUEVO MANTENIMIENTO
          </span>

          <h2>Registrar trabajo</h2>

          {equipo && (
            <div className="mtto-equipo">
              <strong>{equipo.codigo}</strong>
              <span>{equipo.nombre}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          className="mtto-close"
          onClick={onCancelar}
        >
          ×
        </button>
      </div>

      {error && (
        <div className="mtto-error">
          {error}
        </div>
      )}

      <section className="mtto-section">
        <div className="mtto-section__title">
          Datos del equipo
        </div>

        <div className="mtto-grid">
          <AutoField
            label="Código"
            value={equipo?.codigo}
          />

          <AutoField
            label="Equipo / ubicación"
            value={equipo?.nombre}
          />

          <AutoField
            label="Fase"
            value={form.fase || "Sin clasificar"}
          />

          <AutoField
            label="Área"
            value={equipo?.area}
          />

          <AutoField
            label="Tipo"
            value={equipo?.tipo}
          />

          <AutoField
            label="Ubicación física"
            value={equipo?.ubicacion_fisica}
          />
        </div>
      </section>

      <section className="mtto-section">
        <div className="mtto-section__title">
          Trabajo
        </div>

        <div className="mtto-grid">
          <SelectField
            label="Taller *"
            value={form.taller}
            onChange={(v) => cambiar("taller", v)}
            options={[]}
            placeholder="Seleccionar taller"
          />

          <SelectField
            label="Tipo de intervención *"
            value={form.tipo_intervencion}
            onChange={(v) =>
              cambiar("tipo_intervencion", v)
            }
            options={[
              "Preventivo",
              "Correctivo",
              "Predictivo",
              "Inspección",
            ]}
            placeholder="Seleccionar"
          />

          <Field
            label="Fecha"
            type="date"
            value={form.fecha_reporte}
            onChange={(v) =>
              cambiar("fecha_reporte", v)
            }
          />

          <SelectField
            label="Criticidad"
            value={form.tipo_criticidad}
            onChange={(v) =>
              cambiar("tipo_criticidad", v)
            }
            options={[
              "Baja",
              "Media",
              "Alta",
              "Crítica",
            ]}
            placeholder="Seleccionar"
          />

          <Field
            label="Modo de falla"
            value={form.modo_falla}
            onChange={(v) =>
              cambiar("modo_falla", v)
            }
          />

          <SelectField
            label="Prioridad"
            value={form.prioridad}
            onChange={(v) =>
              cambiar("prioridad", v)
            }
            options={[
              "Baja",
              "Media",
              "Alta",
              "Urgente",
            ]}
            placeholder="Seleccionar"
          />

          <SelectField
            label="Estado"
            value={form.estado_falla}
            onChange={(v) =>
              cambiar("estado_falla", v)
            }
            options={estados}
          />
        </div>
      </section>

      <section className="mtto-section">
        <div className="mtto-section__title">
          Descripción
        </div>

        <textarea
          value={form.descripcion_evento}
          onChange={(e) =>
            cambiar(
              "descripcion_evento",
              e.target.value
            )
          }
          placeholder="Describe el trabajo a realizar..."
          rows={3}
        />
      </section>

      <div className="mtto-actions">
        <button
          type="button"
          onClick={onCancelar}
          className="mtto-btn mtto-btn--secondary"
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="mtto-btn mtto-btn--primary"
        >
          {guardando ? "Guardando..." : "Registrar"}
        </button>
      </div>
    </div>
  );
}

function AutoField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="mtto-field">
      <label>{label}</label>
      <div className="mtto-auto">
        {value || "—"}
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
    <div className="mtto-field">
      <label>{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="mtto-field">
      <label>{label}</label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}