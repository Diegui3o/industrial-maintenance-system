import { useEffect, useMemo, useState } from "react";
import {
  listarTodosLosMantenimientos,
  listarProgramacion,
} from "../../../../dashboard/services/mantenimientoApi";
import SemanaHeader from "./SemanaHeader";
import SemanaDias from "./SemanaDias";
import ProgramarTrabajo from "./ProgramarTrabajo";
import RegistrarActividad from "./RegistrarActividad";
import "./programacion.css";

type Trabajo = {
  id: number;
  mantenimientoId: number;
  fecha: string;
  programado: boolean;

  equipo: string;
  actividad: string;
  ot?: string;

  horas: number;
  hh: number;
  avance: number;

  componente?: string;

  programacionId: number;

  personalPlanificado?: number;
  responsablePlanificado?: string;
  turnoPlanificado?: string;
};

type Mantenimiento = {
  id: number;
  equipo_id: number;
  componente_id?: number | null;

  descripcion_evento?: string | null;
  descripcion_tecnica?: string | null;

  porcentaje_avance?: number | null;

  horas_planificadas?: number | null;
  hh_planificadas?: number | null;

  tipo_programacion?: string | null;
  fecha_programada?: string | null;
};

type Equipo = {
  id: number;
  codigo?: string;
  nombre?: string;
};

export default function ProgramacionSemana() {
  const hoy = new Date();

  const inicioSemana = useMemo(() => {
    const fecha = new Date(hoy);
    const dia = fecha.getDay();

    const diferencia = dia === 0 ? -6 : 1 - dia;

    fecha.setDate(fecha.getDate() + diferencia);
    fecha.setHours(0, 0, 0, 0);

    return fecha;
  }, []);

  const [semana, setSemana] = useState(inicioSemana);

  const [diaSeleccionado, setDiaSeleccionado] =
    useState(
      hoy.getDay() === 0
        ? 6
        : hoy.getDay() - 1
    );

  const [trabajos, setTrabajos] =
    useState<Trabajo[]>([]);

  const [cargando, setCargando] =
    useState(false);

  const [programar, setProgramar] =
    useState(false);

  const [
    actividadSeleccionada,
    setActividadSeleccionada,
  ] = useState<Trabajo | null>(null);

  async function cargarTrabajos() {
    try {
      setCargando(true);

      const mantenimientos =
        await listarTodosLosMantenimientos();

      if (!Array.isArray(mantenimientos)) {
        setTrabajos([]);
        return;
      }

      const equiposResponse =
        await fetch("/api/equipos");

      const equiposData =
        equiposResponse.ok
          ? await equiposResponse.json()
          : [];

      const equipos: Equipo[] =
        Array.isArray(equiposData)
          ? equiposData
          : [];

      const resultado: Trabajo[] = [];

      await Promise.all(
        mantenimientos.map(
          async (
            mantenimiento: Mantenimiento
          ) => {
            try {
              const programaciones =
                await listarProgramacion(
                  mantenimiento.id
                );

              if (
                !Array.isArray(programaciones)
              ) {
                return;
              }

              const equipo =
                equipos.find(
                  (item) =>
                    item.id ===
                    mantenimiento.equipo_id
                );

              for (
                const programacion of programaciones
              ) {
                const fecha =
                  programacion.fecha_programada;

                if (!fecha) {
                  continue;
                }

                const horas =
                  Number(
                    programacion.horas_planificadas ??
                      mantenimiento.horas_planificadas ??
                      0
                  ) || 0;

                const hh =
                  Number(
                    programacion.hh_planificadas ??
                      mantenimiento.hh_planificadas ??
                      0
                  ) || 0;

                const avance =
                  Number(
                    mantenimiento.porcentaje_avance ??
                      0
                  ) || 0;

                resultado.push({
                  id: programacion.id,

                  mantenimientoId:
                    mantenimiento.id,

                  programacionId:
                    programacion.id,

                  fecha:
                    String(fecha).slice(0, 10),

                  programado: true,

                  equipo:
                    equipo?.codigo &&
                    equipo?.nombre
                      ? `${equipo.codigo} - ${equipo.nombre}`
                      : equipo?.nombre ||
                        equipo?.codigo ||
                        `Equipo ${mantenimiento.equipo_id}`,

                  actividad:
                    programacion.instrucciones ||
                    mantenimiento.descripcion_evento ||
                    mantenimiento.descripcion_tecnica ||
                    "Mantenimiento",

                  ot:
                    programacion.ot ||
                    undefined,

                  horas,

                  hh,

                  avance,

                  componente:
                    mantenimiento.componente_id
                      ? `Componente ${mantenimiento.componente_id}`
                      : undefined,

                  personalPlanificado:
                    programacion.personal_planificado !=
                    null
                      ? Number(
                          programacion.personal_planificado
                        )
                      : undefined,

                  responsablePlanificado:
                    programacion.responsable_planificado ||
                    undefined,

                  turnoPlanificado:
                    programacion.turno_planificado ||
                    undefined,
                });
              }
            } catch (error) {
              console.error(
                `Error cargando programación del mantenimiento ${mantenimiento.id}:`,
                error
              );
            }
          }
        )
      );

      setTrabajos(resultado);
    } catch (error) {
      console.error(
        "Error cargando programación semanal:",
        error
      );

      setTrabajos([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTrabajos();
  }, []);

  const trabajosSemana =
    trabajos.filter((trabajo) => {
      const fecha = new Date(
        `${trabajo.fecha}T00:00:00`
      );

      const fin = new Date(semana);
      fin.setDate(
        fin.getDate() + 6
      );

      return (
        fecha >= semana &&
        fecha <= fin
      );
    });

  const trabajosDelDia =
    trabajosSemana.filter(
      (trabajo) => {
        const fecha = new Date(
          `${trabajo.fecha}T00:00:00`
        );

        const dia = new Date(semana);

        dia.setDate(
          dia.getDate() +
            diaSeleccionado
        );

        return (
          fecha.getFullYear() ===
            dia.getFullYear() &&
          fecha.getMonth() ===
            dia.getMonth() &&
          fecha.getDate() ===
            dia.getDate()
        );
      }
    );

  const programados =
    trabajosDelDia.filter(
      (trabajo) =>
        trabajo.programado
    );

  const noProgramados =
    trabajosDelDia.filter(
      (trabajo) =>
        !trabajo.programado
    );

  const fechaSeleccionada =
    useMemo(() => {
      const fecha = new Date(
        semana
      );

      fecha.setDate(
        fecha.getDate() +
          diaSeleccionado
      );

      const year =
        fecha.getFullYear();

      const month = String(
        fecha.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        fecha.getDate()
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }, [
      semana,
      diaSeleccionado,
    ]);

  function cambiarSemana(
    valor: number
  ) {
    const nueva = new Date(
      semana
    );

    nueva.setDate(
      nueva.getDate() +
        valor * 7
    );

    setSemana(nueva);

    const hoySemana =
      nueva.getTime() ===
      inicioSemana.getTime();

    setDiaSeleccionado(
      hoySemana
        ? hoy.getDay() === 0
          ? 6
          : hoy.getDay() - 1
        : 0
    );
  }

  function irHoy() {
    setSemana(inicioSemana);

    setDiaSeleccionado(
      hoy.getDay() === 0
        ? 6
        : hoy.getDay() - 1
    );
  }

  function cerrarProgramacion() {
    setProgramar(false);
    cargarTrabajos();
  }

  function cerrarActividad() {
    setActividadSeleccionada(null);
    cargarTrabajos();
  }

  function formatearHoras(
    valor: number
  ) {
    if (Number.isInteger(valor)) {
      return String(valor);
    }

    return valor.toFixed(1);
  }

  return (
    <section className="prog">
      <SemanaHeader
        semana={semana}
        onAnterior={() =>
          cambiarSemana(-1)
        }
        onSiguiente={() =>
          cambiarSemana(1)
        }
        onHoy={irHoy}
      />

      <SemanaDias
        semana={semana}
        trabajos={trabajosSemana}
        diaSeleccionado={
          diaSeleccionado
        }
        onSeleccionar={
          setDiaSeleccionado
        }
      />

      {cargando && (
        <div className="prog-loading">
          Cargando programación...
        </div>
      )}

      <div className="prog-columns">
        {/* PROGRAMADO */}
        <div className="prog-column">
          <div className="prog-column-header">
            <div>
              <h3>
                PROGRAMADO
              </h3>

              <span>
                {programados.length}{" "}
                {programados.length === 1
                  ? "trabajo"
                  : "trabajos"}
              </span>
            </div>
          </div>

          <div className="prog-list">
            {programados.length ===
            0 ? (
              <p className="prog-empty">
                No hay trabajos
                programados para
                este día.
              </p>
            ) : (
              programados.map(
                (trabajo) => {
                  const avance =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        trabajo.avance
                      )
                    );

                  const terminado =
                    avance >= 100;

                  return (
                    <div
                      key={
                        trabajo.programacionId
                      }
                      className={`prog-card ${
                        terminado
                          ? "prog-card--completed"
                          : ""
                      }`}
                    >
                      <div className="prog-card-top">
                        <strong>
                          {trabajo.equipo}
                        </strong>

                        <span
                          className={`prog-status ${
                            terminado
                              ? "prog-status--ok"
                              : "prog-status--pending"
                          }`}
                        >
                          {terminado
                            ? "COMPLETADO"
                            : "PENDIENTE"}
                        </span>
                      </div>

                      <div className="prog-card-info">
                        {trabajo.componente && (
                          <div className="prog-card-detail">
                            <small>
                              COMPONENTE
                            </small>

                            <span>
                              {
                                trabajo.componente
                              }
                            </span>
                          </div>
                        )}

                        <div className="prog-card-detail">
                          <small>
                            ACTIVIDAD
                          </small>

                          <span>
                            {
                              trabajo.actividad
                            }
                          </span>
                        </div>

                        {trabajo.ot && (
                          <div className="prog-card-detail">
                            <small>
                              OT
                            </small>

                            <span>
                              {
                                trabajo.ot
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="prog-card-resources">
                        <small>
                          RECURSOS PLANIFICADOS
                        </small>

                        <div>
                          {trabajo.personalPlanificado !=
                            null && (
                            <span>
                              {
                                trabajo.personalPlanificado
                              }{" "}
                              {trabajo.personalPlanificado ===
                              1
                                ? "persona"
                                : "personas"}
                            </span>
                          )}

                          <span>
                            {
                              formatearHoras(
                                trabajo.horas
                              )
                            }{" "}
                            h
                          </span>

                          <span>
                            {
                              formatearHoras(
                                trabajo.hh
                              )
                            }{" "}
                            HH
                          </span>
                        </div>
                      </div>

                      <div className="prog-progress">
                        <div className="prog-progress-head">
                          <span>
                            AVANCE
                          </span>

                          <strong>
                            {avance}%
                          </strong>
                        </div>

                        <div className="prog-progress-bar">
                          <div
                            style={{
                              width: `${avance}%`,
                            }}
                          />
                        </div>
                      </div>

                      {terminado && (
                        <div className="prog-completed-message">
                          ✓ Trabajo completado
                        </div>
                      )}

                      <button
                        type="button"
                        className="prog-btn prog-btn--main prog-btn--activity"
                        onClick={() =>
                          setActividadSeleccionada(
                            trabajo
                          )
                        }
                      >
                        {terminado
                          ? "Ver actividad"
                          : "Registrar actividad"}
                      </button>
                    </div>
                  );
                }
              )
            )}
          </div>

          <div className="prog-actions">
            <button
              type="button"
              className="prog-btn prog-btn--main"
              onClick={() =>
                setProgramar(true)
              }
            >
              + Programar mantenimiento
            </button>
          </div>
        </div>

        {/* NO PROGRAMADO */}
        <div className="prog-column">
          <div className="prog-column-header">
            <div>
              <h3>
                NO PROGRAMADO
              </h3>

              <span>
                {noProgramados.length}{" "}
                {noProgramados.length === 1
                  ? "trabajo"
                  : "trabajos"}
              </span>
            </div>
          </div>

          <div className="prog-list">
            {noProgramados.length ===
            0 ? (
              <p className="prog-empty">
                No hay trabajos no
                programados.
              </p>
            ) : (
              noProgramados.map(
                (trabajo) => {
                  const avance =
                    Math.min(
                      100,
                      Math.max(
                        0,
                        trabajo.avance
                      )
                    );

                  return (
                    <div
                      key={
                        trabajo.id
                      }
                      className="prog-card prog-card--unplanned"
                    >
                      <div className="prog-card-top">
                        <strong>
                          {trabajo.equipo}
                        </strong>

                        <span className="prog-status prog-status--unplanned">
                          NO PROGRAMADO
                        </span>
                      </div>

                      <div className="prog-card-info">
                        <div className="prog-card-detail">
                          <small>
                            ACTIVIDAD
                          </small>

                          <span>
                            {
                              trabajo.actividad
                            }
                          </span>
                        </div>
                      </div>

                      <div className="prog-card-resources">
                        <small>
                          RECURSOS
                        </small>

                        <div>
                          <span>
                            {
                              formatearHoras(
                                trabajo.horas
                              )
                            }{" "}
                            h
                          </span>

                          <span>
                            {
                              formatearHoras(
                                trabajo.hh
                              )
                            }{" "}
                            HH
                          </span>
                        </div>
                      </div>

                      <div className="prog-progress">
                        <div className="prog-progress-head">
                          <span>
                            AVANCE
                          </span>

                          <strong>
                            {avance}%
                          </strong>
                        </div>

                        <div className="prog-progress-bar">
                          <div
                            style={{
                              width: `${avance}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>
        </div>
      </div>

      {programar && (
        <ProgramarTrabajo
          fechaProgramada={
            fechaSeleccionada
          }
          onCerrar={
            cerrarProgramacion
          }
        />
      )}

      {actividadSeleccionada && (
        <RegistrarActividad
          trabajo={
            actividadSeleccionada
          }
          onCerrar={
            cerrarActividad
          }
        />
      )}
    </section>
  );
}