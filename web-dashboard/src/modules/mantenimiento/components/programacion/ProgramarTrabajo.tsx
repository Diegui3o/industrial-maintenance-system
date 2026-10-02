import { useEffect, useState } from "react";
import {
  crearMantenimiento,
  crearProgramacion,
} from "../../../../dashboard/services/mantenimientoApi";
import { getComponentes } from "../../../../dashboard/DashboardAreas/Planta/services/plantaComponentesApi";
import type { Equipo, Componente, Props } from "./types";
import BuscadorEquipo from "./BuscadorEquipo";
import SelectorComponente from "./SelectorComponente";
import FormularioTrabajoRecursos from "./FormularioTrabajoRecursos";
import "./programar.css";

type TipoProgramacion =
  | "preventivo"
  | "correctivo_programado"
  | "correctivo_no_programado";

const TIPOS_PROGRAMACION = [
  {
    codigo: "preventivo" as const,
    abreviatura: "MP",
    nombre: "Mantenimiento Preventivo",
  },
  {
    codigo: "correctivo_programado" as const,
    abreviatura: "MCP",
    nombre: "Correctivo Programado",
  },
  {
    codigo: "correctivo_no_programado" as const,
    abreviatura: "MCNP",
    nombre: "Correctivo No Programado",
  },
];

export default function ProgramarTrabajo({
  onCerrar,
  fechaProgramada,
}: Props) {
  const [equipoBusqueda, setEquipoBusqueda] = useState("");
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(false);

  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [componente, setComponente] = useState<Componente | null>(null);
  const [cargandoComponentes, setCargandoComponentes] = useState(false);

  const [tipoProgramacion, setTipoProgramacion] =
    useState<TipoProgramacion>("preventivo");

  const [actividad, setActividad] = useState("");
  const [ot, setOt] = useState("");

  const [numeroPersonal, setNumeroPersonal] = useState("");
  const [horas, setHoras] = useState("");
  const [responsable, setResponsable] = useState("");
  const [turno, setTurno] = useState("");

  const [comentario, setComentario] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEquipos();
  }, []);

  async function cargarEquipos() {
    try {
      setCargando(true);

      const respuesta = await fetch("/api/equipos");

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar los equipos");
      }

      const data = await respuesta.json();

      setEquipos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando equipos:", error);
      setEquipos([]);
    } finally {
      setCargando(false);
    }
  }

  async function cargarComponentes(equipoId: number) {
    try {
      setCargandoComponentes(true);
      setComponentes([]);
      setComponente(null);

      const data = await getComponentes(equipoId);

      setComponentes(
        Array.isArray(data)
          ? data.filter(
              (item) =>
                item.activo === undefined || item.activo === true
            )
          : []
      );
    } catch (error) {
      console.error("Error cargando componentes:", error);
      setComponentes([]);
      setComponente(null);
    } finally {
      setCargandoComponentes(false);
    }
  }

  const personal = Number(numeroPersonal) || 0;
  const horasNumero = Number(horas) || 0;
  const hh = personal * horasNumero;

  function seleccionarEquipo(item: Equipo) {
    setEquipo(item);
    setEquipoBusqueda("");
    setError("");
    cargarComponentes(item.id);
  }

  function cambiarEquipo() {
    setEquipo(null);
    setEquipoBusqueda("");
    setComponentes([]);
    setComponente(null);
    setError("");
  }

  function cambiarComponente(valor: string) {
    if (!valor) {
      setComponente(null);
      return;
    }

    const componenteSeleccionado = componentes.find(
      (item) => item.id === Number(valor)
    );

    setComponente(componenteSeleccionado || null);
  }

  async function registrar() {
    if (!equipo) {
      setError("Selecciona un equipo.");
      return;
    }

    if (!actividad.trim()) {
      setError("Ingresa la actividad a realizar.");
      return;
    }

    if (!fechaProgramada) {
      setError("No se encontró la fecha programada.");
      return;
    }

    try {
      setGuardando(true);
      setError("");

      /*
       * mantenimiento usa time.Time.
       * La programación usa DATE.
       */
      const fechaISO = `${fechaProgramada}T00:00:00Z`;

      const mantenimiento = await crearMantenimiento({
        equipo_id: equipo.id,
        componente_id: componente?.id ?? null,

        fecha_reporte: fechaISO,
        fecha_programada: fechaISO,

        fase: equipo.fase?.trim() || "Sin clasificar",
        taller: "Mantenimiento Eléctrico",

        tipo_intervencion:
          tipoProgramacion === "preventivo"
            ? "Preventivo"
            : "Correctivo",

        estado_falla: "abierta",
        prioridad: "Media",

        sistema: equipo.tipo?.trim() || null,

        descripcion_evento: actividad.trim(),
        descripcion_tecnica: comentario.trim() || null,

        causa: null,
        accion_realizada: null,
        consecuencia: null,

        tipo_programacion: tipoProgramacion,

        horas_planificadas:
          horasNumero > 0 ? horasNumero : null,

        hh_planificadas:
          hh > 0 ? hh : null,

        porcentaje_avance: 0,
      });

      const mantenimientoId =
        mantenimiento?.id ?? mantenimiento?.data?.id;

      if (!mantenimientoId) {
        throw new Error(
          "El mantenimiento fue creado, pero no se recibió su ID."
        );
      }

      await crearProgramacion(mantenimientoId, {
        tipo_programacion: tipoProgramacion,

        fecha_programada: fechaProgramada,

        ot: ot.trim() || null,

        horas_planificadas:
          horasNumero > 0 ? horasNumero : null,

        hh_planificadas:
          hh > 0 ? hh : null,

        personal_planificado:
          personal > 0 ? personal : null,

        responsable_planificado:
          responsable.trim() || null,

        turno_planificado:
          turno || null,

        comentario:
          comentario.trim() || null,

        instrucciones:
          actividad.trim(),

        prioridad: "Media",
      });

      onCerrar();
    } catch (error) {
      console.error("Error registrando programación:", error);

      setError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la programación."
      );
    } finally {
      setGuardando(false);
    }
  }

  const fechaTexto = fechaProgramada
    ? new Date(`${fechaProgramada}T00:00:00`).toLocaleDateString(
        "es-PE",
        {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      )
    : "";

  return (
    <div className="prog-modal">
      <div className="prog-form">
        {/* CABECERA */}
        <div className="prog-form-header">
          <div>
            <span>PROGRAMACIÓN SEMANAL</span>
            <h3>Programar mantenimiento</h3>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* ERROR */}
        {error && <div className="prog-error">{error}</div>}

        {/* FECHA */}
        <section className="prog-section">
          <div className="prog-section-title">
            Día programado
          </div>

          <div className="prog-program-date">
            <strong>{fechaTexto}</strong>
          </div>
        </section>

        {/* TIPO */}
        <section className="prog-section">
          <div className="prog-section-title">
            Tipo de mantenimiento
          </div>

          <div className="prog-type-selector">
            {TIPOS_PROGRAMACION.map((tipo) => (
              <button
                key={tipo.codigo}
                type="button"
                className={`prog-type-option ${
                  tipoProgramacion === tipo.codigo
                    ? "prog-type-option--active"
                    : ""
                }`}
                onClick={() => {
                  setTipoProgramacion(tipo.codigo);
                  setError("");
                }}
                title={tipo.nombre}
              >
                <strong>{tipo.abreviatura}</strong>
                <span>{tipo.nombre}</span>
              </button>
            ))}
          </div>
        </section>

        {/* EQUIPO */}
        <BuscadorEquipo
          equipo={equipo}
          equipoBusqueda={equipoBusqueda}
          setEquipoBusqueda={setEquipoBusqueda}
          equipos={equipos}
          cargando={cargando}
          seleccionarEquipo={seleccionarEquipo}
          cambiarEquipo={cambiarEquipo}
        />

        {/* COMPONENTE */}
        <SelectorComponente
          equipo={equipo}
          componentes={componentes}
          componente={componente}
          cargandoComponentes={cargandoComponentes}
          cambiarComponente={cambiarComponente}
        />

        {/* TRABAJO Y RECURSOS */}
        <FormularioTrabajoRecursos
          actividad={actividad}
          setActividad={setActividad}
          ot={ot}
          setOt={setOt}
          comentario={comentario}
          setComentario={setComentario}
          numeroPersonal={numeroPersonal}
          setNumeroPersonal={setNumeroPersonal}
          horas={horas}
          setHoras={setHoras}
          hh={hh}
          responsable={responsable}
          setResponsable={setResponsable}
          turno={turno}
          setTurno={setTurno}
        />

        {/* MATERIALES */}
        <section className="prog-section">
          <div className="prog-section-title">
            Materiales
          </div>

          <div className="prog-material-placeholder">
            Los repuestos y materiales se incorporarán
            posteriormente cuando esté disponible el catálogo.
          </div>
        </section>

        {/* ACCIONES */}
        <div className="prog-bottom">
          <button
            type="button"
            className="prog-cancel"
            onClick={onCerrar}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="prog-save"
            onClick={registrar}
            disabled={
              guardando ||
              !equipo ||
              !actividad.trim()
            }
          >
            {guardando
              ? "Guardando..."
              : "Programar mantenimiento"}
          </button>
        </div>
      </div>
    </div>
  );
}