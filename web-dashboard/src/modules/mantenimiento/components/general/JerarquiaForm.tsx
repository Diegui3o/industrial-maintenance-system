import React, { useEffect, useState } from "react";

type Props = {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
};

export default function JerarquiaForm({ form, setForm }: Props) {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [componentes, setComponentes] = useState<any[]>([]);
  const [subcomponentes, setSubcomponentes] = useState<any[]>([]);

  const [cargandoEquipos, setCargandoEquipos] = useState(false);
  const [cargandoComponentes, setCargandoComponentes] = useState(false);
  const [cargandoSubcomponentes, setCargandoSubcomponentes] =
    useState(false);

  useEffect(() => {
    cargarEquipos();
  }, []);

  useEffect(() => {
    if (form.equipo_id) {
      cargarComponentes(form.equipo_id);
    } else {
      setComponentes([]);
      setSubcomponentes([]);
    }
  }, [form.equipo_id]);

  useEffect(() => {
    if (form.componente_id) {
      cargarSubcomponentes(form.componente_id);
    } else {
      setSubcomponentes([]);
    }
  }, [form.componente_id]);

  async function cargarEquipos() {
    try {
      setCargandoEquipos(true);

      const response = await fetch("/api/equipos");

      if (!response.ok) {
        throw new Error("No se pudieron cargar los equipos.");
      }

      const data = await response.json();

      setEquipos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setEquipos([]);
    } finally {
      setCargandoEquipos(false);
    }
  }

  async function cargarComponentes(equipoId: number) {
    try {
      setCargandoComponentes(true);

      const response = await fetch(
        `/api/equipos/${equipoId}/componentes`
      );

      if (!response.ok) {
        throw new Error("No se pudieron cargar los componentes.");
      }

      const data = await response.json();

      setComponentes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setComponentes([]);
    } finally {
      setCargandoComponentes(false);
    }
  }

  async function cargarSubcomponentes(componenteId: number) {
    try {
      setCargandoSubcomponentes(true);

      const response = await fetch(
        `/api/componentes/${componenteId}/subcomponentes`
      );

      if (!response.ok) {
        throw new Error(
          "No se pudieron cargar los subcomponentes."
        );
      }

      const data = await response.json();

      setSubcomponentes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setSubcomponentes([]);
    } finally {
      setCargandoSubcomponentes(false);
    }
  }

  function cambiarEquipo(valor: string) {
    const equipoId = valor ? Number(valor) : "";

    setForm((prev: any) => ({
      ...prev,
      equipo_id: equipoId,
      componente_id: "",
      subcomponente_id: "",
    }));
  }

  function cambiarComponente(valor: string) {
    const componenteId = valor ? Number(valor) : "";

    setForm((prev: any) => ({
      ...prev,
      componente_id: componenteId,
      subcomponente_id: "",
    }));
  }

  function cambiarSubcomponente(valor: string) {
    setForm((prev: any) => ({
      ...prev,
      subcomponente_id: valor ? Number(valor) : "",
    }));
  }

  return (
    <div style={grid}>
      <div style={field}>
        <label style={label}>Equipo</label>

        <select
          value={form.equipo_id ?? ""}
          onChange={(e) => cambiarEquipo(e.target.value)}
          style={input}
        >
          <option value="">
            {cargandoEquipos
              ? "Cargando equipos..."
              : "Seleccionar equipo"}
          </option>

          {equipos.map((equipo) => (
            <option key={equipo.id} value={equipo.id}>
              {equipo.nombre || equipo.descripcion || `Equipo ${equipo.id}`}
            </option>
          ))}
        </select>
      </div>

      <div style={field}>
        <label style={label}>Componente</label>

        <select
          value={form.componente_id ?? ""}
          onChange={(e) => cambiarComponente(e.target.value)}
          disabled={!form.equipo_id || cargandoComponentes}
          style={input}
        >
          <option value="">
            {cargandoComponentes
              ? "Cargando componentes..."
              : "Seleccionar componente"}
          </option>

          {componentes.map((componente) => (
            <option key={componente.id} value={componente.id}>
              {componente.nombre ||
                componente.descripcion ||
                `Componente ${componente.id}`}
            </option>
          ))}
        </select>
      </div>

      <div style={field}>
        <label style={label}>Subcomponente</label>

        <select
          value={form.subcomponente_id ?? ""}
          onChange={(e) => cambiarSubcomponente(e.target.value)}
          disabled={
            !form.componente_id || cargandoSubcomponentes
          }
          style={input}
        >
          <option value="">
            {cargandoSubcomponentes
              ? "Cargando subcomponentes..."
              : "Seleccionar subcomponente"}
          </option>

          {subcomponentes.map((subcomponente) => (
            <option
              key={subcomponente.id}
              value={subcomponente.id}
            >
              {subcomponente.nombre ||
                subcomponente.descripcion ||
                `Subcomponente ${subcomponente.id}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 16,
};

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const label: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
};

const input: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  padding: "9px 10px",
  background: "#fff",
};