import { useEffect, useMemo, useState } from "react";
import {
  listarTodosLosMantenimientos,
  listarProgramacion,
} from "../../../dashboard/services/mantenimientoApi";
import "./MantenimientoRegistrosSemana.css";

type RegistroSemana = {
  id: number;
  programacionId?: number;
  equipo: string;
  actividad: string;
  ot?: string;
  taller: string;
  avance: number;
  fechaProgramada?: string;
  actualizadoEn?: string;
  estado: "pendiente" | "proceso" | "completado";
};

type Props = {
  seleccionado?: number;
  onSeleccionar: (id: number) => void;
};

type FiltroTaller =
  | "todos"
  | "Mecánico"
  | "Eléctrico"
  | "Instrumentación";

type FiltroEstado =
  | "todos"
  | "pendientes"
  | "proceso"
  | "completados";

type Orden =
  | "actualizacion_reciente"
  | "actualizacion_antigua"
  | "espera_mayor"
  | "espera_menor";

function inicioSemana(fecha: Date) {
  const d = new Date(fecha);
  const dia = d.getDay();

  const diferencia = dia === 0 ? -6 : 1 - dia;

  d.setDate(d.getDate() + diferencia);
  d.setHours(0, 0, 0, 0);

  return d;
}

function finSemana(fecha: Date) {
  const inicio = inicioSemana(fecha);
  const fin = new Date(inicio);

  fin.setDate(fin.getDate() + 6);
  fin.setHours(23, 59, 59, 999);

  return fin;
}

function fechaValida(valor?: string | null) {
  if (!valor) return null;

  const fecha = new Date(valor);

  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFecha(valor?: string) {
  const fecha = fechaValida(valor);

  if (!fecha) return "Sin actualización";

  return fecha.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
  });
}

function tiempoEspera(valor?: string) {
  const fecha = fechaValida(valor);

  if (!fecha) return "Sin actividad";

  const ahora = new Date();
  const diferencia = ahora.getTime() - fecha.getTime();

  if (diferencia <= 0) return "0 min";

  const minutos = Math.floor(diferencia / 60000);

  if (minutos < 60) {
    return `${minutos} min`;
  }

  const horas = Math.floor(minutos / 60);

  if (horas < 24) {
    return `${horas} h`;
  }

  const dias = Math.floor(horas / 24);

  return `${dias} d ${horas % 24} h`;
}

function obtenerEstado(
  avance: number
): RegistroSemana["estado"] {
  if (avance >= 100) return "completado";
  if (avance > 0) return "proceso";

  return "pendiente";
}

function normalizarTaller(valor?: string | null) {
  if (!valor) return "Sin taller";

  const texto = valor.toLowerCase();

  if (texto.includes("instrument")) {
    return "Instrumentación";
  }

  if (texto.includes("mecán")) {
    return "Mecánico";
  }

  if (texto.includes("eléctr") || texto.includes("electr")) {
    return "Eléctrico";
  }

  return valor;
}

function obtenerEquipo(mantenimiento: any) {
  if (mantenimiento.equipo_codigo) {
    return mantenimiento.equipo_codigo;
  }

  if (mantenimiento.codigo_equipo) {
    return mantenimiento.codigo_equipo;
  }

  if (mantenimiento.equipo_nombre) {
    return mantenimiento.equipo_nombre;
  }

  if (mantenimiento.equipo) {
    if (typeof mantenimiento.equipo === "string") {
      return mantenimiento.equipo;
    }

    return (
      mantenimiento.equipo.codigo ||
      mantenimiento.equipo.nombre ||
      `Equipo #${mantenimiento.equipo_id}`
    );
  }

  return `Equipo #${mantenimiento.equipo_id}`;
}

function obtenerActividad(
  mantenimiento: any,
  programacion: any
) {
  return (
    programacion?.instrucciones ||
    programacion?.comentario ||
    mantenimiento.descripcion_tecnica ||
    mantenimiento.descripcion_evento ||
    "Sin actividad"
  );
}

function obtenerUltimaActualizacion(
  mantenimiento: any
) {
  return (
    mantenimiento.actualizado_en ||
    mantenimiento.updated_at ||
    mantenimiento.fecha_actualizacion
  );
}

export default function MantenimientoRegistrosSemana({
  seleccionado,
  onSeleccionar,
}: Props) {
  const [registros, setRegistros] = useState<RegistroSemana[]>([]);
  const [cargando, setCargando] = useState(true);

  const [taller, setTaller] =
    useState<FiltroTaller>("todos");

  const [estado, setEstado] =
    useState<FiltroEstado>("todos");

  const [orden, setOrden] = useState<Orden>(
    "actualizacion_reciente"
  );

  useEffect(() => {
    cargarRegistros();
  }, []);

  async function cargarRegistros() {
    try {
      setCargando(true);

      const mantenimientos =
        await listarTodosLosMantenimientos();

      const ahora = new Date();
      const inicio = inicioSemana(ahora);
      const fin = finSemana(ahora);

      const resultado: RegistroSemana[] = [];

      for (const mantenimiento of mantenimientos || []) {
        let programaciones: any[] = [];

        try {
          programaciones =
            await listarProgramacion(mantenimiento.id);
        } catch {
          programaciones = [];
        }

        /*
         * Si tiene programación, usamos las programaciones
         * de esta semana.
         */
        if (programaciones.length > 0) {
          for (const programacion of programaciones) {
            const fecha = fechaValida(
              programacion.fecha_programada
            );

            if (
              !fecha ||
              fecha < inicio ||
              fecha > fin
            ) {
              continue;
            }

            const avance = Math.min(
              100,
              Math.max(
                0,
                Number(
                  mantenimiento.porcentaje_avance ?? 0
                )
              )
            );

            resultado.push({
              id: mantenimiento.id,
              programacionId: programacion.id,
              equipo: obtenerEquipo(mantenimiento),
              actividad: obtenerActividad(
                mantenimiento,
                programacion
              ),
              ot:
                programacion.ot ||
                mantenimiento.ot ||
                undefined,
              taller: normalizarTaller(
                mantenimiento.taller
              ),
              avance,
              fechaProgramada:
                programacion.fecha_programada,
              actualizadoEn:
                obtenerUltimaActualizacion(
                  mantenimiento
                ),
              estado: obtenerEstado(avance),
            });
          }

          continue;
        }

        /*
         * Mantenimientos sin programación:
         * solamente entran si tienen una fecha programada
         * dentro de la semana.
         */
        const fecha = fechaValida(
          mantenimiento.fecha_programada
        );

        if (
          fecha &&
          fecha >= inicio &&
          fecha <= fin
        ) {
          const avance = Math.min(
            100,
            Math.max(
              0,
              Number(
                mantenimiento.porcentaje_avance ?? 0
              )
            )
          );

          resultado.push({
            id: mantenimiento.id,
            equipo: obtenerEquipo(mantenimiento),
            actividad: obtenerActividad(
              mantenimiento,
              null
            ),
            ot: mantenimiento.ot || undefined,
            taller: normalizarTaller(
              mantenimiento.taller
            ),
            avance,
            fechaProgramada:
              mantenimiento.fecha_programada,
            actualizadoEn:
              obtenerUltimaActualizacion(
                mantenimiento
              ),
            estado: obtenerEstado(avance),
          });
        }
      }

      setRegistros(resultado);
    } catch (error) {
      console.error(
        "Error cargando registros de la semana:",
        error
      );

      setRegistros([]);
    } finally {
      setCargando(false);
    }
  }

  const registrosFiltrados = useMemo(() => {
    const filtrados = registros.filter((registro) => {
      const coincideTaller =
        taller === "todos" ||
        registro.taller === taller;

      const coincideEstado =
        estado === "todos" ||
        (estado === "pendientes" &&
          registro.estado === "pendiente") ||
        (estado === "proceso" &&
          registro.estado === "proceso") ||
        (estado === "completados" &&
          registro.estado === "completado");

      return coincideTaller && coincideEstado;
    });

    return filtrados.sort((a, b) => {
      const fechaA =
        fechaValida(a.actualizadoEn)?.getTime() ?? 0;

      const fechaB =
        fechaValida(b.actualizadoEn)?.getTime() ?? 0;

      if (
        orden === "actualizacion_reciente"
      ) {
        return fechaB - fechaA;
      }

      if (
        orden === "actualizacion_antigua"
      ) {
        return fechaA - fechaB;
      }

      if (
        orden === "espera_mayor"
      ) {
        return fechaA - fechaB;
      }

      return fechaB - fechaA;
    });
  }, [registros, taller, estado, orden]);

  return (
    <section className="registros-semana">

      <div className="registros-semana-header">
        <div className="registros-semana-title">
          <strong>Esta semana</strong>

          <span>
            {registrosFiltrados.length}
          </span>
        </div>

        <button
          type="button"
          className="registros-semana-refresh"
          onClick={cargarRegistros}
          title="Actualizar"
        >
          ↻
        </button>
      </div>

      <div className="registros-semana-filtros">

        <select
          value={taller}
          onChange={(e) =>
            setTaller(
              e.target.value as FiltroTaller
            )
          }
        >
          <option value="todos">
            Todos los talleres
          </option>

          <option value="Mecánico">
            Mecánico
          </option>

          <option value="Eléctrico">
            Eléctrico
          </option>

          <option value="Instrumentación">
            Instrumentación
          </option>
        </select>

        <select
          value={estado}
          onChange={(e) =>
            setEstado(
              e.target.value as FiltroEstado
            )
          }
        >
          <option value="todos">
            Todos los estados
          </option>

          <option value="pendientes">
            Pendientes
          </option>

          <option value="proceso">
            En proceso
          </option>

          <option value="completados">
            Completados
          </option>
        </select>

        <select
          value={orden}
          onChange={(e) =>
            setOrden(e.target.value as Orden)
          }
        >
          <option value="actualizacion_reciente">
            Última actualización
          </option>

          <option value="actualizacion_antigua">
            Más antiguos
          </option>

          <option value="espera_mayor">
            Mayor espera
          </option>

          <option value="espera_menor">
            Menor espera
          </option>
        </select>

      </div>

      <div className="registros-semana-lista">

        {cargando ? (
          <div className="registros-semana-vacio">
            Cargando registros...
          </div>
        ) : registrosFiltrados.length === 0 ? (
          <div className="registros-semana-vacio">
            <strong>
              No hay registros
            </strong>

            <span>
              No existen mantenimientos para esta
              semana con los filtros seleccionados.
            </span>
          </div>
        ) : (
          registrosFiltrados.map((registro) => (
            <button
              key={`${registro.id}-${registro.programacionId ?? "base"}`}
              type="button"
              className={`registro-semana-item ${
                seleccionado === registro.id
                  ? "selected"
                  : ""
              } ${
                registro.estado === "completado"
                  ? "completed"
                  : ""
              }`}
              onClick={() =>
                onSeleccionar(registro.id)
              }
            >

              <div className="registro-semana-top">

                <span className="registro-semana-equipo">
                  {registro.equipo}
                </span>

                <span
                  className={`registro-semana-percent ${
                    registro.estado
                  }`}
                >
                  {registro.avance}%
                </span>

              </div>

              <div className="registro-semana-actividad">
                {registro.actividad}
              </div>

              <div className="registro-semana-meta">

                <span>
                  {registro.taller}
                </span>

                {registro.ot && (
                  <span>
                    OT {registro.ot}
                  </span>
                )}

              </div>

              <div className="registro-semana-progress">

                <div>
                  <span
                    style={{
                      width: `${registro.avance}%`,
                    }}
                  />
                </div>

              </div>

              <div className="registro-semana-footer">

                <span>
                  {registro.actualizadoEn
                    ? `Act. ${formatearFecha(
                        registro.actualizadoEn
                      )}`
                    : "Sin actualización"}
                </span>

                <span
                  className={
                    registro.estado === "completado"
                      ? "espera-ok"
                      : ""
                  }
                >
                  {registro.estado ===
                  "completado"
                    ? "Cerrado"
                    : `Espera ${tiempoEspera(
                        registro.actualizadoEn
                      )}`}
                </span>

              </div>

            </button>
          ))
        )}

      </div>

    </section>
  );
}