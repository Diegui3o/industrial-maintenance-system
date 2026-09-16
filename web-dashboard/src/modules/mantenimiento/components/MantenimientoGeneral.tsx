import { useEffect, useState } from "react";
import { actualizarMantenimiento } from "../../../dashboard/services/mantenimientoApi";

import DatosForm from "./general/DatosForm";
import ParadaForm from "./general/ParadaForm";
import DescripcionForm from "./general/DescripcionForm";
import AvanceForm from "./general/AvanceForm";
import OtrosForm from "./general/OtrosForm";

type Props = {
  mantenimiento: any;
  onActualizado: () => void;
};

type Seccion = "datos" | "parada" | "descripcion" | "avance" | "otros";

const formularioInicial = {
  equipo_id: "",
  usuario_id: "",
  fecha_reporte: "",
  fase: "",
  taller: "",
  tipo_criticidad: "",
  sistema: "",
  inicio_parada: "",
  fin_parada: "",
  horas: "",
  tipo_intervencion: "",
  modo_falla: "",
  consecuencia_inmediata: "",
  descripcion_evento: "",
  stand_by: false,
  produccion_afectada: false,
  tn_dejadas_procesar: "",
  enlace: "",
  estado_falla: "abierta",

  componente_id: "",
  subcomponente_id: "",
  prioridad: "",
  causa: "",
  accion_realizada: "",
  consecuencia: "",
  descripcion_tecnica: "",

  fecha_inicio_real: "",
  fecha_fin_real: "",
  porcentaje_avance: "",
  tipo_programacion: "",
  fecha_programada: "",
  horas_planificadas: "",
  hh_planificadas: "",
  horas_ejecutadas: "",
  hh_ejecutadas: "",
};

export default function MantenimientoGeneral({
  mantenimiento,
  onActualizado,
}: Props) {
  const [form, setForm] = useState<any>(formularioInicial);
  const [seccion, setSeccion] = useState<Seccion>("datos");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mantenimiento) return;

    setForm({
      ...formularioInicial,
      ...mantenimiento,
    });
  }, [mantenimiento]);

  const guardar = async () => {
    try {
      setGuardando(true);
      setError("");

      await actualizarMantenimiento(mantenimiento.id, form);

      onActualizado();
    } catch (err: any) {
      setError(
        err?.message ||
          "No se pudo actualizar el mantenimiento."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={container}>
      <div style={tabs}>
        <Tab
          activo={seccion === "datos"}
          onClick={() => setSeccion("datos")}
        >
          Datos
        </Tab>

        <Tab
          activo={seccion === "parada"}
          onClick={() => setSeccion("parada")}
        >
          Parada e impacto
        </Tab>

        <Tab
          activo={seccion === "descripcion"}
          onClick={() => setSeccion("descripcion")}
        >
          Descripción
        </Tab>

        <Tab
          activo={seccion === "avance"}
          onClick={() => setSeccion("avance")}
        >
          Avance
        </Tab>

        <Tab
          activo={seccion === "otros"}
          onClick={() => setSeccion("otros")}
        >
          Otros
        </Tab>
      </div>

      <div style={content}>
        {seccion === "datos" && (
          <Section title="Datos del mantenimiento">
            <DatosForm
              form={form}
              setForm={setForm}
            />
          </Section>
        )}

        {seccion === "parada" && (
          <Section title="Parada e impacto">
            <ParadaForm
              form={form}
              setForm={setForm}
            />
          </Section>
        )}

        {seccion === "descripcion" && (
          <Section title="Descripción">
            <DescripcionForm
              form={form}
              setForm={setForm}
            />
          </Section>
        )}

        {seccion === "avance" && (
          <Section title="Avance">
            <AvanceForm
              form={form}
              setForm={setForm}
            />
          </Section>
        )}

        {seccion === "otros" && (
          <Section title="Otros">
            <OtrosForm
              form={form}
              setForm={setForm}
            />
          </Section>
        )}

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <div style={actions}>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            style={saveButton}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 style={sectionTitle}>{title}</h3>
      {children}
    </section>
  );
}

function Tab({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...tab,
        ...(activo ? activeTab : {}),
      }}
    >
      {children}
    </button>
  );
}

const container: React.CSSProperties = {
  width: "100%",
};

const tabs: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 20,
  borderBottom: "1px solid #ddd",
  paddingBottom: 8,
  flexWrap: "wrap",
};

const tab: React.CSSProperties = {
  border: "1px solid #ddd",
  background: "#fff",
  borderRadius: 6,
  padding: "8px 14px",
  cursor: "pointer",
  fontSize: 14,
};

const activeTab: React.CSSProperties = {
  background: "#f97316",
  color: "#fff",
  borderColor: "#f97316",
};

const content: React.CSSProperties = {
  width: "100%",
};

const sectionTitle: React.CSSProperties = {
  margin: "0 0 16px",
  fontSize: 18,
};

const actions: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 24,
};

const saveButton: React.CSSProperties = {
  border: "none",
  background: "#f97316",
  color: "#fff",
  borderRadius: 6,
  padding: "10px 18px",
  cursor: "pointer",
  fontWeight: 600,
};

const errorStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 12,
  borderRadius: 6,
  background: "#fee2e2",
  color: "#991b1b",
};