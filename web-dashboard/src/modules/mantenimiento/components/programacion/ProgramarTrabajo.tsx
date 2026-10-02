import { useEffect, useState } from "react";
import {
  crearMantenimiento,
  crearProgramacion,
} from "../../../../dashboard/services/mantenimientoApi";
import { getComponentes } from "../../../../dashboard/DashboardAreas/Planta/services/plantaComponentesApi";
import "./programar.css";

type Equipo = {
  id: number;
  codigo: string;
  nombre: string;
  fase?: string;
  area?: string;
  tipo?: string;
  ubicacion?: string;
};

type Componente = {
  id: number;
  equipo_id?: number | null;
  codigo?: string | null;
  codigo_sap?: string | null;
  tag?: string | null;
  nombre: string;
  tipo_componente?: string | null;
  marca?: string | null;
  modelo?: string | null;
  numero_serie?: string | null;
  descripcion?: string | null;
  activo?: boolean;
};

type Props = {
  onCerrar: () => void;
  fechaProgramada?: string;
};

export default function ProgramarTrabajo({
  onCerrar,
  fechaProgramada,
}: Props) {
  const [equipoBusqueda, setEquipoBusqueda] = useState("");
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(false);

  const [componentes, setComponentes] = useState<Componente[]>([]);
  const [componente, setComponente] =
    useState<Componente | null>(null);
  const [cargandoComponentes, setCargandoComponentes] =
    useState(false);

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
                item.activo === undefined ||
                item.activo === true
            )
          : []
      );
    } catch (error) {
      console.error(
        "Error cargando componentes:",
        error
      );

      setComponentes([]);
      setComponente(null);
    } finally {
      setCargandoComponentes(false);
    }
  }

  const resultados = equipos.filter((item) => {
    const texto = equipoBusqueda
      .toLowerCase()
      .trim();

    if (!texto) {
      return false;
    }

    return (
      item.codigo?.toLowerCase().includes(texto) ||
      item.nombre?.toLowerCase().includes(texto)
    );
  });

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

    const componenteSeleccionado =
      componentes.find(
        (item) => item.id === Number(valor)
      );

    setComponente(
      componenteSeleccionado || null
    );
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
      setError(
        "No se encontró la fecha programada."
      );
      return;
    }

    try {
      setGuardando(true);
      setError("");

      /*
       * Primero creamos el mantenimiento.
       *
       * El equipo es obligatorio.
       * El componente es opcional.
       */
      const mantenimiento =
        await crearMantenimiento({
          equipo_id: equipo.id,

          componente_id:
            componente?.id ?? null,

          fecha_reporte:
            fechaProgramada,

          fecha_programada:
            fechaProgramada,

          fase:
            equipo.fase?.trim() ||
            "Sin clasificar",

          taller:
            "Mantenimiento Eléctrico",

          tipo_intervencion:
            "Preventivo",

          estado_falla:
            "abierta",

          prioridad:
            "Media",

          sistema:
            equipo.tipo?.trim() || null,

          descripcion_evento:
            actividad.trim(),

          descripcion_tecnica:
            comentario.trim() || null,

          causa:
            null,

          accion_realizada:
            null,

          consecuencia:
            null,

          tipo_programacion:
            "preventivo",

          horas_planificadas:
            horasNumero > 0
              ? horasNumero
              : null,

          hh_planificadas:
            hh > 0
              ? hh
              : null,

          porcentaje_avance: 0,
        });

      const mantenimientoId =
        mantenimiento?.id ??
        mantenimiento?.data?.id;

      if (!mantenimientoId) {
        throw new Error(
          "El mantenimiento fue creado, pero no se recibió su ID."
        );
      }

      /*
       * Luego registramos la programación semanal
       * asociada al mantenimiento recién creado.
       */
      await crearProgramacion(
        mantenimientoId,
        {
          tipo_programacion:
            "preventivo",

          fecha_programada:
            fechaProgramada,

          ot:
            ot.trim() || null,

          horas_planificadas:
            horasNumero > 0
              ? horasNumero
              : null,

          hh_planificadas:
            hh > 0
              ? hh
              : null,

          comentario:
            comentario.trim() || null,

          instrucciones:
            actividad.trim(),

          prioridad:
            "Media",
        }
      );

      /*
       * Por ahora no guardamos repuestos/materiales.
       * Esa parte se implementará posteriormente
       * cuando exista un catálogo real y confiable.
       */

      console.log(
        "PROGRAMACIÓN SEMANAL REGISTRADA:",
        {
          mantenimientoId,
          equipo,
          componente,
          fechaProgramada,
          actividad,
          ot,
          numeroPersonal: personal,
          horas: horasNumero,
          hh,
          responsable,
          turno,
          comentario,
        }
      );

      onCerrar();
    } catch (error) {
      console.error(
        "Error registrando programación:",
        error
      );

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
    ? new Date(
        `${fechaProgramada}T00:00:00`
      ).toLocaleDateString("es-PE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="prog-modal">
      <div className="prog-form">
        {/* CABECERA */}

        <div className="prog-form-header">
          <div>
            <span>
              PROGRAMACIÓN SEMANAL
            </span>

            <h3>
              Programar mantenimiento
            </h3>
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

        {error && (
          <div className="prog-error">
            {error}
          </div>
        )}

        {/* FECHA */}

        <section className="prog-section">
          <div className="prog-section-title">
            Día programado
          </div>

          <div className="prog-program-date">
            <strong>
              {fechaTexto}
            </strong>
          </div>
        </section>

        {/* EQUIPO */}

        <section className="prog-section">
          <div className="prog-section-title">
            Equipo
          </div>

          {!equipo ? (
          <div className="prog-equipment-search">
            <div className="prog-equipment-searchbox">
              <span className="prog-search-icon">⌕</span>

              <input
                value={equipoBusqueda}
                onChange={(e) => {
                  setEquipoBusqueda(e.target.value);
                  setEquipo(null);
                }}
                placeholder="Buscar equipo..."
                autoFocus
              />

              {equipoBusqueda && (
                <button
                  type="button"
                  className="prog-search-clear"
                  onClick={() => setEquipoBusqueda("")}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>

            {equipoBusqueda && (
              <div className="prog-results">
                {cargando && (
                  <div className="prog-no-results">
                    Buscando equipos...
                  </div>
                )}

                {!cargando &&
                  resultados.slice(0, 8).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="prog-result"
                      onClick={() => seleccionarEquipo(item)}
                    >
                      <span className="prog-result-code">
                        {item.codigo}
                      </span>

                      <span className="prog-result-name">
                        {item.nombre}
                      </span>
                    </button>
                  ))}

                {!cargando &&
                  resultados.length === 0 && (
                    <div className="prog-no-results">
                      No se encontraron equipos
                    </div>
                  )}

                {!cargando && resultados.length > 8 && (
                  <div className="prog-results-more">
                    Mostrando 8 de {resultados.length} equipos
                  </div>
                )}
              </div>
            )}
          </div>
          ) : (
            <div className="prog-equipment-selected">
              <div>
                <strong>
                  {equipo.nombre}
                </strong>

                <span>
                  {equipo.codigo}
                </span>
              </div>

              <button
                type="button"
                onClick={cambiarEquipo}
              >
                Cambiar
              </button>
            </div>
          )}

          {equipo && (
            <div className="prog-equipment-meta">
              <span>
                Fase:{" "}
                <strong>
                  {equipo.fase ||
                    "Sin clasificar"}
                </strong>
              </span>

              <span>
                Área:{" "}
                <strong>
                  {equipo.area || "—"}
                </strong>
              </span>

              <span>
                Tipo:{" "}
                <strong>
                  {equipo.tipo || "—"}
                </strong>
              </span>

              <span>
                Ubicación:{" "}
                <strong>
                  {equipo.ubicacion || "—"}
                </strong>
              </span>
            </div>
          )}
        </section>

        {/* COMPONENTE */}

        {equipo && (
          <section className="prog-section">
            <div className="prog-section-title">
              Componente
            </div>

            <label>
              Componente
              <select
                value={
                  componente?.id ?? ""
                }
                onChange={(e) =>
                  cambiarComponente(
                    e.target.value
                  )
                }
                disabled={
                  cargandoComponentes
                }
              >
                <option value="">
                  {cargandoComponentes
                    ? "Cargando componentes..."
                    : componentes.length === 0
                    ? "Sin componentes registrados"
                    : "Mantenimiento a nivel de equipo"}
                </option>

                {componentes.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.tag
                        ? `${item.tag} - `
                        : ""}
                      {item.nombre}
                      {item.codigo_sap
                        ? ` (${item.codigo_sap})`
                        : ""}
                    </option>
                  )
                )}
              </select>
            </label>

            {componente && (
              <div className="prog-equipment-meta">
                {componente.tag && (
                  <span>
                    TAG:{" "}
                    <strong>
                      {componente.tag}
                    </strong>
                  </span>
                )}

                {componente.tipo_componente && (
                  <span>
                    Tipo:{" "}
                    <strong>
                      {
                        componente.tipo_componente
                      }
                    </strong>
                  </span>
                )}

                {componente.marca && (
                  <span>
                    Marca:{" "}
                    <strong>
                      {componente.marca}
                    </strong>
                  </span>
                )}

                {componente.modelo && (
                  <span>
                    Modelo:{" "}
                    <strong>
                      {componente.modelo}
                    </strong>
                  </span>
                )}
              </div>
            )}
          </section>
        )}

        {/* TRABAJO */}

        <section className="prog-section">
          <div className="prog-section-title">
            Trabajo
          </div>

          <div className="prog-grid prog-grid--two">
            <label>
              Actividad *
              <input
                value={actividad}
                onChange={(e) =>
                  setActividad(
                    e.target.value
                  )
                }
                placeholder="¿Qué trabajo se realizará?"
              />
            </label>

            <label>
              OT
              <input
                value={ot}
                onChange={(e) =>
                  setOt(e.target.value)
                }
                placeholder="Número de OT"
              />
            </label>
          </div>

          <label>
            Comentario / justificación
            <textarea
              value={comentario}
              onChange={(e) =>
                setComentario(
                  e.target.value
                )
              }
              placeholder="Detalle, alcance o justificación del trabajo..."
              rows={3}
            />
          </label>
        </section>

        {/* RECURSOS */}

        <section className="prog-section">
          <div className="prog-section-title">
            Recursos
          </div>

          <div className="prog-grid">
            <label>
              N° personal
              <input
                type="number"
                min="1"
                value={
                  numeroPersonal
                }
                onChange={(e) =>
                  setNumeroPersonal(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Total horas mantto.
              <input
                type="number"
                min="0"
                step="0.5"
                value={horas}
                onChange={(e) =>
                  setHoras(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              H-H
              <input
                value={
                  hh
                    ? hh.toFixed(2)
                    : ""
                }
                readOnly
                className="prog-calculated"
              />
            </label>

            <label>
              Responsable
              <input
                value={responsable}
                onChange={(e) =>
                  setResponsable(
                    e.target.value
                  )
                }
              />
            </label>

            <label>
              Turno
              <select
                value={turno}
                onChange={(e) =>
                  setTurno(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Seleccionar
                </option>

                <option value="dia">
                  Día
                </option>

                <option value="noche">
                  Noche
                </option>
              </select>
            </label>
          </div>
        </section>

        {/* MATERIALES */}

        <section className="prog-section">
          <div className="prog-section-title">
            Materiales
          </div>

          <div className="prog-material-placeholder">
            Los repuestos y materiales se
            incorporarán posteriormente
            cuando esté disponible el catálogo.
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